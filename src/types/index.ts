export type UserRole = "user" | "admin" | "superadmin";

export interface User {
  id: string;
  auth_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  user_id: string;
  business_name: string;
  business_category: BusinessCategory;
  owner_name: string;
  owner_phone: string;
  owner_email: string | null;
  business_phone: string | null;
  service_area: string | null;
  business_hours: BusinessHours;
  services_offered: string[];
  pricing_info: string | null;
  booking_url: string | null;
  custom_greeting: string | null;
  custom_instructions: string | null;
  faq: FAQItem[];
  twilio_phone_number: string | null;
  twilio_phone_sid: string | null;
  vapi_assistant_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_plan: PlanName;
  subscription_status: SubscriptionStatus;
  calls_used_this_month: number;
  calls_limit: number;
  billing_cycle_start: string;
  is_active: boolean;
  setup_completed: boolean;
  google_calendar_connected: boolean;
  google_refresh_token: string | null;
  google_calendar_id: string;
  created_at: string;
  updated_at: string;
}

export type BusinessCategory =
  | "plumber"
  | "dentist"
  | "salon"
  | "lawyer"
  | "hvac"
  | "electrician"
  | "general";

export type PlanName = "free" | "starter" | "pro";
export type SubscriptionStatus = "active" | "past_due" | "canceled";

export interface BusinessHours {
  [day: string]: { open: string; close: string } | "closed";
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface Call {
  id: string;
  business_id: string;
  caller_phone: string | null;
  caller_name: string | null;
  call_duration_seconds: number | null;
  twilio_call_sid: string | null;
  vapi_call_id: string | null;
  call_summary: string | null;
  caller_need: string | null;
  urgency: Urgency | null;
  caller_address: string | null;
  caller_email: string | null;
  appointment_requested: boolean;
  appointment_datetime: string | null;
  transcript: TranscriptMessage[] | null;
  recording_url: string | null;
  sentiment: Sentiment | null;
  call_outcome: CallOutcome | null;
  ai_confidence_score: number | null;
  sms_sent: boolean;
  email_sent: boolean;
  owner_reviewed: boolean;
  status: CallStatus;
  created_at: string;
}

export type Urgency = "low" | "medium" | "high" | "emergency";
export type Sentiment = "positive" | "neutral" | "negative";
export type CallOutcome =
  | "appointment_booked"
  | "message_taken"
  | "info_provided"
  | "caller_hung_up"
  | "transferred";
export type CallStatus = "in_progress" | "completed" | "failed";

export interface TranscriptMessage {
  role: string;
  content: string;
}

export interface Plan {
  id: string;
  name: PlanName;
  display_name: string;
  price_cents: number;
  calls_per_month: number;
  stripe_price_id: string | null;
  features: string[];
  is_active: boolean;
}

export interface KnowledgeBaseEntry {
  id: string;
  business_id: string;
  category: string;
  question: string;
  answer: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  business_id: string;
  call_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  appointment_date: string;
  duration_minutes: number;
  service_requested: string | null;
  notes: string | null;
  status: AppointmentStatus;
  google_event_id: string | null;
  google_calendar_synced: boolean;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface BusinessTemplate {
  id: string;
  category: string;
  display_name: string;
  default_greeting: string;
  default_instructions: string;
  default_services: string[];
  default_faq: FAQItem[];
  icon: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ExtractedCallData {
  callerName: string | null;
  callerNeed: string | null;
  urgency: Urgency;
  callerAddress: string | null;
  callerEmail: string | null;
  appointmentRequested: boolean;
  appointmentPreference: string | null;
  summary: string;
  sentiment: Sentiment;
  callOutcome: CallOutcome;
  confidenceScore: number;
}

export interface VapiWebhookPayload {
  message: {
    type: string;
    call?: {
      id: string;
      orgId: string;
      type: string;
      phoneCallProviderId?: string;
      phoneNumberId?: string;
      assistantId?: string;
      customer?: {
        number?: string;
      };
      status: string;
      startedAt?: string;
      endedAt?: string;
      transcript?: string;
      recordingUrl?: string;
      messages?: TranscriptMessage[];
    };
    timestamp?: string;
    artifact?: {
      messages?: TranscriptMessage[];
      transcript?: string;
      recordingUrl?: string;
    };
    endedReason?: string;
  };
}
