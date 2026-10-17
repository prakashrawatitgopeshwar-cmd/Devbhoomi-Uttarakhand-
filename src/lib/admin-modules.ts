export type FieldOption = { label: string; value: string };
export type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "boolean" | "select" | "url" | "email";
  required?: boolean;
  help?: string;
  options?: FieldOption[];
};
export type ModuleConfig = {
  title: string;
  singular: string;
  description: string;
  table: string;
  primaryKey: string;
  fields: FieldConfig[];
  listFields: string[];
  searchFields: string[];
  sortBy: string;
  readOnly?: boolean;
};

const options = (values: string[]): FieldOption[] => values.map((value) => ({ label: value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), value }));
const statusField = (values: string[]): FieldConfig => ({ name: "status", label: "Status", type: "select", required: true, options: options(values) });

export const adminModules: Record<string, ModuleConfig> = {
  districts: {
    title: "Districts", singular: "district", description: "Manage Uttarakhand district landing pages and their publication status.",
    table: "districts", primaryKey: "id", sortBy: "name",
    fields: [
      { name: "name", label: "District name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "text", help: "Leave blank to generate it from the district name." },
      { name: "division", label: "Division / region", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "hero_image_url", label: "Hero image URL", type: "url" },
      { name: "is_published", label: "Published", type: "boolean" },
    ],
    listFields: ["name", "division", "is_published", "updated_at"], searchFields: ["name", "division", "slug"],
  },
  destinations: {
    title: "Destinations & Temples", singular: "destination", description: "Manage destination details, source verification and publish status. Verify time-sensitive claims before publishing.",
    table: "destinations", primaryKey: "id", sortBy: "updated_at",
    fields: [
      { name: "name", label: "Destination name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "text", help: "Leave blank to generate it from the destination name." },
      { name: "category", label: "Category", type: "select", options: options(["Spiritual Circuits", "Hill Stations & Gateways", "Lakes & Glaciers Corridor", "Protected Areas & Wildlife", "Nature", "Adventure", "Culture", "Other"]) },
      { name: "district", label: "District", type: "text" },
      { name: "summary", label: "Short summary", type: "textarea" },
      { name: "description", label: "Full description", type: "textarea" },
      { name: "best_time_to_visit", label: "Best time to visit", type: "text" },
      { name: "latitude", label: "Latitude", type: "number" },
      { name: "longitude", label: "Longitude", type: "number" },
      { name: "image_url", label: "Image URL", type: "url" },
      { name: "source_url", label: "Verification source URL", type: "url" },
      { name: "verification_status", label: "Verification status", type: "select", options: options(["unverified", "needs_review", "verified"]) },
      { name: "last_verified_at", label: "Last verified date", type: "date" },
      { name: "is_published", label: "Published", type: "boolean" },
    ],
    listFields: ["name", "category", "district", "verification_status", "is_published", "updated_at"], searchFields: ["name", "district", "category", "slug"],
  },
  "hotel-applications": {
    title: "Hotel & Partner Applications", singular: "partner application", description: "Review onboarding requests. Approval requires document verification; no listing is auto-published.",
    table: "partner_applications", primaryKey: "id", sortBy: "created_at",
    fields: [
      { name: "business_name", label: "Business name", type: "text", required: true },
      { name: "partner_type", label: "Partner type", type: "select", options: options(["hotel", "homestay", "tour_operator", "cab_operator", "guide", "activity_provider", "other"]) },
      { name: "contact_name", label: "Contact person", type: "text", required: true },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "district", label: "District", type: "text" },
      { name: "documents_verified", label: "Documents verified", type: "boolean" },
      ...[statusField(["pending", "in_review", "approved", "rejected", "needs_information"])],
      { name: "review_note", label: "Reviewer note / rejection reason", type: "textarea" },
    ],
    listFields: ["business_name", "partner_type", "contact_name", "district", "status", "documents_verified", "created_at"], searchFields: ["business_name", "contact_name", "email", "phone", "district"],
  },
  stays: {
    title: "Stays", singular: "stay listing", description: "Manage accommodation listings and their review/publication state.",
    table: "stays", primaryKey: "id", sortBy: "updated_at",
    fields: [
      { name: "name", label: "Property name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "text" },
      { name: "district", label: "District", type: "text" },
      { name: "stay_type", label: "Stay type", type: "select", options: options(["hotel", "resort", "homestay", "guesthouse", "ashram", "camp", "cottage", "other"]) },
      { name: "description", label: "Description", type: "textarea" },
      { name: "address", label: "Address", type: "textarea" },
      { name: "contact_name", label: "Contact person", type: "text" },
      { name: "contact_email", label: "Contact email", type: "email" },
      { name: "contact_phone", label: "Contact phone", type: "text" },
      { name: "price_from", label: "Indicative starting price (INR)", type: "number" },
      { name: "currency", label: "Currency", type: "text" },
      { name: "amenities", label: "Amenities (comma separated)", type: "textarea" },
      { name: "image_url", label: "Image URL", type: "url" },
      { name: "listing_verified", label: "Listing verified", type: "boolean" },
      ...[statusField(["draft", "pending", "approved", "rejected", "published"])],
    ],
    listFields: ["name", "district", "stay_type", "price_from", "status", "listing_verified", "updated_at"], searchFields: ["name", "district", "stay_type", "slug"],
  },
  packages: {
    title: "Tour Packages", singular: "tour package", description: "Create packages with indicative pricing and itinerary details. Confirm availability separately for each service.",
    table: "packages", primaryKey: "id", sortBy: "updated_at",
    fields: [
      { name: "title", label: "Package title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "text" },
      { name: "summary", label: "Short summary", type: "textarea" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "duration_days", label: "Duration (days)", type: "number", required: true },
      { name: "starting_price", label: "Indicative starting price (INR)", type: "number" },
      { name: "currency", label: "Currency", type: "text" },
      { name: "max_group_size", label: "Maximum group size", type: "number" },
      { name: "itinerary", label: "Day-by-day itinerary", type: "textarea" },
      { name: "inclusions", label: "Inclusions", type: "textarea" },
      { name: "exclusions", label: "Exclusions", type: "textarea" },
      { name: "content_verified", label: "Content reviewed and verified", type: "boolean" },
      { name: "is_published", label: "Published", type: "boolean" },
    ],
    listFields: ["title", "duration_days", "starting_price", "currency", "content_verified", "is_published", "updated_at"], searchFields: ["title", "summary", "slug"],
  },
  bookings: {
    title: "Booking Requests", singular: "booking request", description: "Track requests and provider-confirmed service status. Do not mark confirmed unless price, availability and provider reference are verified.",
    table: "bookings", primaryKey: "id", sortBy: "created_at",
    fields: [
      { name: "trip_reference", label: "Trip reference", type: "text", required: true },
      { name: "customer_name", label: "Customer name", type: "text", required: true },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "service_type", label: "Service type", type: "select", options: options(["trip_plan", "cab", "stay", "package", "activity", "other"]) },
      { name: "destination", label: "Destination / route", type: "text" },
      { name: "package_title", label: "Package (if applicable)", type: "text" },
      { name: "travel_date", label: "Travel date", type: "date" },
      { name: "travellers", label: "Travellers", type: "number" },
      { name: "quoted_total", label: "Indicative quoted total (INR)", type: "number" },
      { name: "currency", label: "Currency", type: "text" },
      { name: "availability_verified", label: "Provider availability verified", type: "boolean" },
      { name: "price_verified", label: "Provider price verified", type: "boolean" },
      { name: "provider_reference", label: "Provider confirmation/reference", type: "text" },
      ...[statusField(["requested", "under_review", "awaiting_provider", "provider_confirmed", "cancelled", "completed"])],
      { name: "admin_notes", label: "Internal operations notes", type: "textarea" },
    ],
    listFields: ["trip_reference", "customer_name", "service_type", "destination", "travel_date", "travellers", "status", "created_at"], searchFields: ["trip_reference", "customer_name", "email", "phone", "destination"],
  },
  customers: {
    title: "Customers", singular: "customer", description: "Maintain customer support records. Restrict exports and share customer details only with authorized staff.",
    table: "customers", primaryKey: "id", sortBy: "created_at",
    fields: [
      { name: "full_name", label: "Full name", type: "text", required: true },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "preferred_language", label: "Preferred language", type: "select", options: options(["en", "hi"]) },
      { name: "contact_consent", label: "Contact consent recorded", type: "boolean" },
      { name: "notes", label: "Support notes", type: "textarea" },
    ],
    listFields: ["full_name", "email", "phone", "preferred_language", "contact_consent", "created_at"], searchFields: ["full_name", "email", "phone"],
  },
  moderation: {
    title: "Reviews & Moderation", singular: "review", description: "Review customer-submitted content before publishing it.",
    table: "reviews", primaryKey: "id", sortBy: "created_at",
    fields: [
      { name: "reviewer_name", label: "Reviewer name", type: "text", required: true },
      { name: "destination_name", label: "Destination / stay", type: "text" },
      { name: "rating", label: "Rating (1–5)", type: "number", required: true },
      { name: "title", label: "Review title", type: "text" },
      { name: "body", label: "Review", type: "textarea", required: true },
      ...[statusField(["pending", "published", "rejected", "flagged"])],
      { name: "admin_note", label: "Moderation note", type: "textarea" },
    ],
    listFields: ["reviewer_name", "destination_name", "rating", "title", "status", "created_at"], searchFields: ["reviewer_name", "destination_name", "title", "body"],
  },
  enquiries: {
    title: "Customer Enquiries", singular: "enquiry", description: "Track customer questions and the follow-up status.",
    table: "enquiries", primaryKey: "id", sortBy: "created_at",
    fields: [
      { name: "name", label: "Customer name", type: "text", required: true },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "subject", label: "Subject", type: "text", required: true },
      { name: "message", label: "Message", type: "textarea", required: true },
      ...[statusField(["new", "in_progress", "waiting_for_customer", "resolved", "spam"])],
      { name: "admin_note", label: "Internal follow-up note", type: "textarea" },
    ],
    listFields: ["name", "subject", "email", "phone", "status", "created_at"], searchFields: ["name", "subject", "email", "phone", "message"],
  },
  "site-builder": {
    title: "Homepage Builder", singular: "homepage section", description: "Edit homepage sections as drafts. Publishing changes on the public site requires that site to read this content source.",
    table: "homepage_sections", primaryKey: "id", sortBy: "sort_order",
    fields: [
      { name: "section_key", label: "Section key", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "subtitle", label: "Subtitle", type: "text" },
      { name: "body", label: "Body copy", type: "textarea" },
      { name: "image_url", label: "Image URL", type: "url" },
      { name: "cta_label", label: "Call-to-action label", type: "text" },
      { name: "cta_url", label: "Call-to-action URL", type: "url" },
      { name: "sort_order", label: "Display order", type: "number" },
      { name: "is_visible", label: "Visible to connected consumers", type: "boolean" },
    ],
    listFields: ["section_key", "title", "sort_order", "is_visible", "updated_at"], searchFields: ["section_key", "title", "subtitle", "body"],
  },
  settings: {
    title: "Site Settings", singular: "setting", description: "Manage portal-owned settings. Credentials and payment secrets must never be stored here.",
    table: "site_settings", primaryKey: "id", sortBy: "setting_key",
    fields: [
      { name: "setting_key", label: "Setting key", type: "text", required: true },
      { name: "value_text", label: "Value", type: "textarea" },
      { name: "description", label: "Description", type: "textarea" },
    ],
    listFields: ["setting_key", "value_text", "description", "updated_at"], searchFields: ["setting_key", "value_text", "description"],
  },
  "route-readiness": {
    title: "Route Readiness", singular: "route", description: "A route may be activated only after Operations, pricing, partner verification and Admin approval are all complete.",
    table: "route_readiness", primaryKey: "id", sortBy: "updated_at",
    fields: [
      { name: "route_name", label: "Route name", type: "text", required: true },
      { name: "route_code", label: "Route code", type: "text", required: true },
      { name: "start_location", label: "Start location", type: "text", required: true },
      { name: "end_location", label: "End location", type: "text", required: true },
      { name: "service_type", label: "Service type", type: "select", options: options(["cab", "stay", "package", "activity"]) },
      { name: "operations_ready", label: "Operations readiness signed off", type: "boolean" },
      { name: "pricing_ready", label: "Pricing reviewed", type: "boolean" },
      { name: "partners_ready", label: "Partners verified and eligible", type: "boolean" },
      { name: "admin_approved", label: "Authorized admin approval", type: "boolean" },
      { name: "is_active", label: "Enable customer booking for this route", type: "boolean", help: "Can be enabled only when all four readiness checks are complete." },
      { name: "notes", label: "Readiness notes / blockers", type: "textarea" },
    ],
    listFields: ["route_name", "route_code", "start_location", "end_location", "operations_ready", "pricing_ready", "partners_ready", "admin_approved", "is_active", "updated_at"], searchFields: ["route_name", "route_code", "start_location", "end_location"],
  },
  fleet: {
    title: "Cab Fleet", singular: "vehicle", description: "Manage vehicle capacity, document checks and operational availability. Assignment logic must check eligibility before dispatch.",
    table: "fleet_vehicles", primaryKey: "id", sortBy: "updated_at",
    fields: [
      { name: "vehicle_name", label: "Vehicle label", type: "text", required: true },
      { name: "vehicle_type", label: "Vehicle category", type: "select", options: options(["hatchback_sedan", "suv_muv", "tempo_traveller", "luxury", "bus_minibus"]) },
      { name: "registration_no", label: "Registration number", type: "text" },
      { name: "seats", label: "Passenger seats", type: "number", required: true },
      { name: "luggage_capacity", label: "Luggage capacity (bags)", type: "number" },
      { name: "permit_verified", label: "Permit verified", type: "boolean" },
      { name: "insurance_verified", label: "Insurance verified", type: "boolean" },
      { name: "is_available", label: "Available for assignment", type: "boolean" },
      { name: "notes", label: "Operational notes", type: "textarea" },
    ],
    listFields: ["vehicle_name", "vehicle_type", "registration_no", "seats", "permit_verified", "insurance_verified", "is_available", "updated_at"], searchFields: ["vehicle_name", "vehicle_type", "registration_no"],
  },
  "fare-rules": {
    title: "Cab Fare Rules", singular: "fare rule", description: "Store indicative tariffs and itemized pricing assumptions; do not present a fare as verified until an eligible provider confirms it.",
    table: "fare_rules", primaryKey: "id", sortBy: "updated_at",
    fields: [
      { name: "rule_name", label: "Rule name", type: "text", required: true },
      { name: "service_type", label: "Vehicle category", type: "select", options: options(["hatchback_sedan", "suv_muv", "tempo_traveller", "luxury", "bus_minibus"]) },
      { name: "route_code", label: "Route code (optional)", type: "text" },
      { name: "pricing_model", label: "Pricing model", type: "select", options: options(["fixed_route", "per_km", "per_hour"]) },
      { name: "base_fare", label: "Base fare (INR)", type: "number" },
      { name: "per_km_rate", label: "Per-kilometre rate (INR)", type: "number" },
      { name: "per_hour_rate", label: "Per-hour rate (INR)", type: "number" },
      { name: "included_km", label: "Kilometres included", type: "number" },
      { name: "tolls_included", label: "Tolls included", type: "boolean" },
      { name: "driver_allowance", label: "Driver allowance (INR)", type: "number" },
      { name: "currency", label: "Currency", type: "text" },
      { name: "is_active", label: "Active for quoting", type: "boolean" },
      { name: "notes", label: "Included / excluded charges and notes", type: "textarea" },
    ],
    listFields: ["rule_name", "service_type", "route_code", "pricing_model", "base_fare", "per_km_rate", "currency", "is_active", "updated_at"], searchFields: ["rule_name", "service_type", "route_code", "pricing_model"],
  },
  support: {
    title: "Support & Incidents", singular: "support case", description: "Track customer support issues and active-trip incidents. This console does not replace emergency services.",
    table: "support_cases", primaryKey: "id", sortBy: "created_at",
    fields: [
      { name: "case_reference", label: "Case reference", type: "text", required: true },
      { name: "trip_reference", label: "Trip reference", type: "text" },
      { name: "customer_name", label: "Customer name", type: "text", required: true },
      { name: "contact", label: "Customer contact", type: "text" },
      { name: "severity", label: "Severity", type: "select", options: options(["low", "normal", "high", "critical"]) },
      { name: "category", label: "Category", type: "select", options: options(["general", "booking", "provider", "safety", "road_disruption", "accessibility", "complaint", "other"]) },
      { name: "description", label: "Issue / incident details", type: "textarea", required: true },
      ...[statusField(["open", "in_progress", "waiting", "escalated", "resolved", "closed"])],
      { name: "assigned_to", label: "Assigned staff", type: "text" },
      { name: "resolution_notes", label: "Resolution / next steps", type: "textarea" },
    ],
    listFields: ["case_reference", "trip_reference", "customer_name", "severity", "category", "status", "assigned_to", "created_at"], searchFields: ["case_reference", "trip_reference", "customer_name", "contact", "category", "description"],
  },
  "audit-logs": {
    title: "Audit Logs", singular: "audit entry", description: "Read-only history of administrative changes. Audit records cannot be edited or deleted from this console.",
    table: "audit_logs", primaryKey: "id", sortBy: "created_at", readOnly: true,
    fields: [],
    listFields: ["actor_email", "action", "resource", "record_id", "created_at", "details"], searchFields: ["actor_email", "action", "resource", "record_id"],
  },
};
