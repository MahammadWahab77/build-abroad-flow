-- Enable RLS policies for all CRUD operations on leads table
CREATE POLICY "Allow anonymous insert on leads"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous update on leads"
ON public.leads
FOR UPDATE
TO anon
USING (true);

CREATE POLICY "Allow anonymous delete on leads"
ON public.leads
FOR DELETE
TO anon
USING (true);

-- Enable RLS policies for tasks table
CREATE POLICY "Allow anonymous insert on tasks"
ON public.tasks
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous update on tasks"
ON public.tasks
FOR UPDATE
TO anon
USING (true);

CREATE POLICY "Allow anonymous delete on tasks"
ON public.tasks
FOR DELETE
TO anon
USING (true);

-- Enable RLS policies for remarks table
CREATE POLICY "Allow anonymous insert on remarks"
ON public.remarks
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous update on remarks"
ON public.remarks
FOR UPDATE
TO anon
USING (true);

CREATE POLICY "Allow anonymous delete on remarks"
ON public.remarks
FOR DELETE
TO anon
USING (true);

-- Enable RLS policies for stage_history table
CREATE POLICY "Allow anonymous insert on stage_history"
ON public.stage_history
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous update on stage_history"
ON public.stage_history
FOR UPDATE
TO anon
USING (true);

CREATE POLICY "Allow anonymous delete on stage_history"
ON public.stage_history
FOR DELETE
TO anon
USING (true);

-- Enable RLS policies for university_applications table
CREATE POLICY "Allow anonymous insert on university_applications"
ON public.university_applications
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous update on university_applications"
ON public.university_applications
FOR UPDATE
TO anon
USING (true);

CREATE POLICY "Allow anonymous delete on university_applications"
ON public.university_applications
FOR DELETE
TO anon
USING (true);

-- Enable RLS policies for documents table
CREATE POLICY "Allow anonymous insert on documents"
ON public.documents
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous update on documents"
ON public.documents
FOR UPDATE
TO anon
USING (true);

CREATE POLICY "Allow anonymous delete on documents"
ON public.documents
FOR DELETE
TO anon
USING (true);