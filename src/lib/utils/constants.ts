export const APP_NAME = "MissedCall.ai";
export const APP_DESCRIPTION = "AI-powered phone receptionist for small businesses";

export const PLAN_LIMITS = {
  free: 5,
  starter: 50,
  pro: 200,
} as const;

export const PLAN_PRICES = {
  free: 0,
  starter: 29,
  pro: 59,
} as const;

export const CALLS_PER_PAGE = 20;

export const BUSINESS_CATEGORIES = [
  { value: "plumber", label: "Plumbing Business", icon: "Wrench" },
  { value: "dentist", label: "Dental Practice", icon: "Stethoscope" },
  { value: "salon", label: "Hair Salon / Barbershop", icon: "Scissors" },
  { value: "lawyer", label: "Law Firm", icon: "Scale" },
  { value: "hvac", label: "HVAC / Heating & Cooling", icon: "Thermometer" },
  { value: "electrician", label: "Electrical Services", icon: "Zap" },
  { value: "general", label: "General Business", icon: "Building2" },
] as const;

export const DAYS_OF_WEEK = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
] as const;

export const DEFAULT_BUSINESS_HOURS = {
  mon: { open: "08:00", close: "17:00" },
  tue: { open: "08:00", close: "17:00" },
  wed: { open: "08:00", close: "17:00" },
  thu: { open: "08:00", close: "17:00" },
  fri: { open: "08:00", close: "17:00" },
  sat: "closed" as const,
  sun: "closed" as const,
};
