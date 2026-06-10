-- Close the RLS hole on the template-owned RAG embeddings table.
-- Writes happen via service role (bypasses RLS); reads are for authenticated users.
ALTER TABLE public.intelligence_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read embeddings"
  ON public.intelligence_embeddings
  FOR SELECT
  TO authenticated
  USING (true);
