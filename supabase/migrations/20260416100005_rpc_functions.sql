-- Vector similarity search for RAG

CREATE OR REPLACE FUNCTION search_intel(
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  filter_entity_type text DEFAULT NULL
)
RETURNS TABLE (
  chunk_text text,
  content_section text,
  entity_type text,
  entity_slug text,
  entity_name text,
  similarity float
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    ie.chunk_text,
    ie.content_section,
    ie.entity_type,
    ie.entity_slug,
    ie.entity_name,
    1 - (ie.embedding <=> query_embedding) AS similarity
  FROM intelligence_embeddings ie
  WHERE (filter_entity_type IS NULL OR ie.entity_type = filter_entity_type)
  ORDER BY ie.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
