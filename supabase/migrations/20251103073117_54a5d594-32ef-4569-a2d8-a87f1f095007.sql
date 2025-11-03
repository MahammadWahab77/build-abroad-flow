-- Add UUID columns for new auth system references in leads table
ALTER TABLE public.leads 
  ADD COLUMN counselor_uuid UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN manager_uuid UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add indexes for the new UUID columns
CREATE INDEX idx_leads_counselor_uuid ON public.leads(counselor_uuid);
CREATE INDEX idx_leads_manager_uuid ON public.leads(manager_uuid);

-- Add UUID columns for new auth system references in documents table  
ALTER TABLE public.documents
  ADD COLUMN uploaded_by_uuid UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX idx_documents_uploaded_by_uuid ON public.documents(uploaded_by_uuid);

-- Add UUID columns for new auth system references in remarks table
ALTER TABLE public.remarks
  ADD COLUMN user_uuid UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE INDEX idx_remarks_user_uuid ON public.remarks(user_uuid);

-- Add UUID columns for new auth system references in stage_history table
ALTER TABLE public.stage_history
  ADD COLUMN user_uuid UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE INDEX idx_stage_history_user_uuid ON public.stage_history(user_uuid);

-- Add UUID columns for new auth system references in tasks table
ALTER TABLE public.tasks
  ADD COLUMN user_uuid UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE INDEX idx_tasks_user_uuid ON public.tasks(user_uuid);

-- Note: Old integer columns (counselor_id, manager_id, user_id, uploaded_by) are kept
-- for backward compatibility. They will be deprecated once migration is complete.