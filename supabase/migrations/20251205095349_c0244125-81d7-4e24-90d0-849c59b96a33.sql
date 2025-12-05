-- Add flight_status column to tasks table for Flight and Accommodation tracking
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS flight_status text NULL;