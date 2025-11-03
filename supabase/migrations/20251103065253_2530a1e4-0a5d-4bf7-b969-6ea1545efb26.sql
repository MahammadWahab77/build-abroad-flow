-- Add INSERT policy for users table
-- This allows authenticated users to create new users
CREATE POLICY "Allow authenticated users to insert users"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add UPDATE policy for users table
CREATE POLICY "Allow authenticated users to update users"
ON public.users
FOR UPDATE
TO authenticated
USING (true);

-- Add DELETE policy for users table
CREATE POLICY "Allow authenticated users to delete users"
ON public.users
FOR DELETE
TO authenticated
USING (true);