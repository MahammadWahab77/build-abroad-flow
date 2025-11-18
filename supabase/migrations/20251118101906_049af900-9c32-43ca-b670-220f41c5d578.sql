-- Make user_id nullable in remarks table since it's a legacy field
-- The system now uses user_uuid for user references
ALTER TABLE public.remarks 
ALTER COLUMN user_id DROP NOT NULL;

-- Do the same for stage_history table
ALTER TABLE public.stage_history 
ALTER COLUMN user_id DROP NOT NULL;

-- And tasks table
ALTER TABLE public.tasks 
ALTER COLUMN user_id DROP NOT NULL;

-- And documents table
ALTER TABLE public.documents 
ALTER COLUMN uploaded_by DROP NOT NULL;