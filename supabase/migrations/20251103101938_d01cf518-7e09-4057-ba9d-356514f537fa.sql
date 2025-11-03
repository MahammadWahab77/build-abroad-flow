-- Grant SELECT on leads to admins and counselors under RLS
CREATE POLICY "Admins can view all leads"
ON public.leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Counselors can view assigned leads"
ON public.leads
FOR SELECT
USING (auth.uid() = counselor_uuid);