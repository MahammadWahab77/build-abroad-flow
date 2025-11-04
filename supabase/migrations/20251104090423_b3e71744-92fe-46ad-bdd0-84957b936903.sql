-- Remove all anonymous access policies that expose data publicly
-- These policies allowed unauthenticated users to view, modify, and delete sensitive data

-- Drop anonymous policies on leads table
DROP POLICY IF EXISTS "Allow anonymous read access to leads" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous insert on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous update on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous delete on leads" ON public.leads;

-- Drop anonymous policies on university_applications table
DROP POLICY IF EXISTS "Allow anonymous read access to university_applications" ON public.university_applications;
DROP POLICY IF EXISTS "Allow anonymous insert on university_applications" ON public.university_applications;
DROP POLICY IF EXISTS "Allow anonymous update on university_applications" ON public.university_applications;
DROP POLICY IF EXISTS "Allow anonymous delete on university_applications" ON public.university_applications;

-- Drop anonymous policies on documents table
DROP POLICY IF EXISTS "Allow anonymous read access to documents" ON public.documents;
DROP POLICY IF EXISTS "Allow anonymous insert on documents" ON public.documents;
DROP POLICY IF EXISTS "Allow anonymous update on documents" ON public.documents;
DROP POLICY IF EXISTS "Allow anonymous delete on documents" ON public.documents;

-- Drop anonymous policies on remarks table
DROP POLICY IF EXISTS "Allow anonymous read access to remarks" ON public.remarks;
DROP POLICY IF EXISTS "Allow anonymous insert on remarks" ON public.remarks;
DROP POLICY IF EXISTS "Allow anonymous update on remarks" ON public.remarks;
DROP POLICY IF EXISTS "Allow anonymous delete on remarks" ON public.remarks;

-- Drop anonymous policies on tasks table
DROP POLICY IF EXISTS "Allow anonymous read access to tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow anonymous insert on tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow anonymous update on tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow anonymous delete on tasks" ON public.tasks;

-- Drop anonymous policies on stage_history table
DROP POLICY IF EXISTS "Allow anonymous read access to stage_history" ON public.stage_history;
DROP POLICY IF EXISTS "Allow anonymous insert on stage_history" ON public.stage_history;
DROP POLICY IF EXISTS "Allow anonymous update on stage_history" ON public.stage_history;
DROP POLICY IF EXISTS "Allow anonymous delete on stage_history" ON public.stage_history;

-- Add proper authenticated policies for leads table
CREATE POLICY "Admins can insert leads" ON public.leads
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update leads" ON public.leads
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Counselors can update assigned leads" ON public.leads
FOR UPDATE TO authenticated
USING (auth.uid() = counselor_uuid);

CREATE POLICY "Admins can delete leads" ON public.leads
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add proper authenticated policies for university_applications
CREATE POLICY "Counselors can view applications for assigned leads" ON public.university_applications
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = university_applications.lead_id
    AND leads.counselor_uuid = auth.uid()
  )
);

CREATE POLICY "Admins can view all applications" ON public.university_applications
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Counselors can insert applications for assigned leads" ON public.university_applications
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = university_applications.lead_id
    AND leads.counselor_uuid = auth.uid()
  )
);

CREATE POLICY "Admins can insert applications" ON public.university_applications
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Counselors can update applications for assigned leads" ON public.university_applications
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = university_applications.lead_id
    AND leads.counselor_uuid = auth.uid()
  )
);

CREATE POLICY "Admins can update all applications" ON public.university_applications
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete applications" ON public.university_applications
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add proper authenticated policies for documents
CREATE POLICY "Counselors can view documents for assigned leads" ON public.documents
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = documents.lead_id
    AND leads.counselor_uuid = auth.uid()
  )
);

CREATE POLICY "Admins can view all documents" ON public.documents
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Counselors can insert documents for assigned leads" ON public.documents
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = documents.lead_id
    AND leads.counselor_uuid = auth.uid()
  )
);

CREATE POLICY "Admins can insert documents" ON public.documents
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Counselors can update documents for assigned leads" ON public.documents
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = documents.lead_id
    AND leads.counselor_uuid = auth.uid()
  )
);

CREATE POLICY "Admins can update all documents" ON public.documents
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete documents" ON public.documents
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add proper authenticated policies for remarks
CREATE POLICY "Counselors can view remarks for assigned leads" ON public.remarks
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = remarks.lead_id
    AND leads.counselor_uuid = auth.uid()
  )
);

CREATE POLICY "Admins can view all remarks" ON public.remarks
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Counselors can insert remarks for assigned leads" ON public.remarks
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = remarks.lead_id
    AND leads.counselor_uuid = auth.uid()
  )
);

CREATE POLICY "Admins can insert remarks" ON public.remarks
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Counselors can update remarks for assigned leads" ON public.remarks
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = remarks.lead_id
    AND leads.counselor_uuid = auth.uid()
  )
);

CREATE POLICY "Admins can update all remarks" ON public.remarks
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete remarks" ON public.remarks
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add proper authenticated policies for tasks
CREATE POLICY "Counselors can view tasks for assigned leads" ON public.tasks
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = tasks.lead_id
    AND leads.counselor_uuid = auth.uid()
  )
);

CREATE POLICY "Admins can view all tasks" ON public.tasks
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Counselors can insert tasks for assigned leads" ON public.tasks
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = tasks.lead_id
    AND leads.counselor_uuid = auth.uid()
  )
);

CREATE POLICY "Admins can insert tasks" ON public.tasks
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Counselors can update tasks for assigned leads" ON public.tasks
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = tasks.lead_id
    AND leads.counselor_uuid = auth.uid()
  )
);

CREATE POLICY "Admins can update all tasks" ON public.tasks
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tasks" ON public.tasks
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add proper authenticated policies for stage_history
CREATE POLICY "Counselors can view stage history for assigned leads" ON public.stage_history
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = stage_history.lead_id
    AND leads.counselor_uuid = auth.uid()
  )
);

CREATE POLICY "Admins can view all stage history" ON public.stage_history
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Counselors can insert stage history for assigned leads" ON public.stage_history
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = stage_history.lead_id
    AND leads.counselor_uuid = auth.uid()
  )
);

CREATE POLICY "Admins can insert stage history" ON public.stage_history
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));