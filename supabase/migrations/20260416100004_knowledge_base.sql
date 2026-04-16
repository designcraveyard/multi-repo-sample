-- Knowledge base with vector embeddings for RAG

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE insight_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text,
  slug text UNIQUE NOT NULL,
  report_text text,
  entity_name text,
  created_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now()
);

ALTER TABLE insight_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read insight reports" ON insight_reports FOR SELECT USING (true);

CREATE TABLE intelligence_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid REFERENCES insight_reports ON DELETE CASCADE,
  entity_type text,
  entity_slug text,
  chunk_text text NOT NULL,
  content_section text,
  embedding vector(1536),
  chunk_index int DEFAULT 0,
  entity_name text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_embeddings_entity ON intelligence_embeddings(entity_type, entity_slug);
CREATE INDEX idx_embeddings_vector ON intelligence_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 20);
