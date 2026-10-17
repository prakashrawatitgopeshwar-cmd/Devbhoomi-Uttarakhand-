"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-access";
import { adminModules } from "@/lib/admin-modules";

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function cleanValue(value: FormDataEntryValue | null, type: string) {
  if (type === "boolean") return value === "on" || value === "true";
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (type === "number") {
    const n = Number(raw);
    if (!Number.isFinite(n)) throw new Error("Please enter a valid number.");
    return n;
  }
  return raw;
}

export async function saveRecord(formData: FormData) {
  const section = String(formData.get("_section") ?? "");
  const id = String(formData.get("_id") ?? "");
  const config = adminModules[section];
  if (!config || config.readOnly) redirect("/admin/" + section + "?error=invalid");

  const { supabase, user } = await requireAdmin();
  const record: Record<string, unknown> = {};
  try {
    for (const field of config.fields) {
      const value = cleanValue(formData.get(field.name), field.type);
      if (field.required && (value === null || value === "")) throw new Error(field.label + " is required.");
      record[field.name] = value;
    }
    const slugField = config.fields.find((field) => field.name === "slug");
    const nameValue = String(record.name ?? record.title ?? record.business_name ?? record.route_name ?? "");
    if (slugField && !record.slug && nameValue) record.slug = slugify(nameValue);
    if (section === "route-readiness" && record.is_active && !(record.operations_ready && record.pricing_ready && record.partners_ready && record.admin_approved)) {
      throw new Error("Route cannot be activated until all four readiness checks are complete.");
    }
    if (section === "hotel-applications" && record.status === "approved" && record.documents_verified !== true) {
      throw new Error("Verify partner documents before approving this application.");
    }
    if (section === "bookings" && record.status === "provider_confirmed" && (!(record.availability_verified && record.price_verified) || !record.provider_reference)) {
      throw new Error("A booking can be marked provider-confirmed only after price, availability and provider reference are verified.");
    }
    if (section === "stays" && record.status === "published" && record.listing_verified !== true) {
      throw new Error("Verify the listing before publishing it.");
    }
    if (section === "packages" && record.is_published && record.content_verified !== true) {
      throw new Error("Review and verify package content before publishing.");
    }

    let query: any = supabase.from(config.table);
    let savedId = id;
    if (id) {
      const { data, error } = await query.update(record).eq(config.primaryKey, id).select(config.primaryKey).single();
      if (error) throw new Error(error.message);
      savedId = String(data[config.primaryKey]);
    } else {
      const { data, error } = await query.insert(record).select(config.primaryKey).single();
      if (error) throw new Error(error.message);
      savedId = String(data[config.primaryKey]);
    }

    const { error: auditError } = await supabase.from("audit_logs").insert({
      actor_id: user.id,
      actor_email: user.email ?? null,
      action: id ? "update" : "create",
      resource: config.table,
      record_id: savedId,
      details: { fields: Object.keys(record) },
    });
    if (auditError) throw new Error("Record saved, but audit logging failed: " + auditError.message);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save record.";
    redirect("/admin/" + section + "?error=" + encodeURIComponent(message));
  }

  revalidatePath("/admin");
  revalidatePath("/admin/" + section);
  redirect("/admin/" + section + "?saved=1");
}

export async function deleteRecord(formData: FormData) {
  const section = String(formData.get("_section") ?? "");
  const id = String(formData.get("_id") ?? "");
  const config = adminModules[section];
  if (!config || config.readOnly || !id) redirect("/admin/" + section + "?error=invalid");

  const { supabase, user } = await requireAdmin();
  const { error } = await supabase.from(config.table).delete().eq(config.primaryKey, id);
  if (error) redirect("/admin/" + section + "?error=" + encodeURIComponent(error.message));

  const { error: auditError } = await supabase.from("audit_logs").insert({
    actor_id: user.id, actor_email: user.email ?? null, action: "delete", resource: config.table, record_id: id, details: {},
  });
  if (auditError) redirect("/admin/" + section + "?error=" + encodeURIComponent("Deleted, but audit logging failed: " + auditError.message));

  revalidatePath("/admin");
  revalidatePath("/admin/" + section);
  redirect("/admin/" + section + "?deleted=1");
}
