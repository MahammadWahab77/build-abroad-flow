-- Fix Security Definer Views by setting security_invoker = true
-- This ensures views use the calling user's permissions instead of the view owner's

ALTER VIEW public.apps_submitted_daily SET (security_invoker = true);
ALTER VIEW public.counselling_conversions_daily SET (security_invoker = true);
ALTER VIEW public.duplicate_leads SET (security_invoker = true);
ALTER VIEW public.followups_daily SET (security_invoker = true);
ALTER VIEW public.leads_daily SET (security_invoker = true);
ALTER VIEW public.leads_instagram_daily SET (security_invoker = true);
ALTER VIEW public.leads_monthly SET (security_invoker = true);
ALTER VIEW public.leads_normalized SET (security_invoker = true);
ALTER VIEW public.leads_weekly SET (security_invoker = true);
ALTER VIEW public.shortlisting_daily SET (security_invoker = true);