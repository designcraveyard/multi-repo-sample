-- Remove the ChatKit demo table and the unused RAG source-document table (owner decision 2026-06-10).
-- job_preferences: only consumer is /assistant-embed (ChatKit), which is being removed.
-- insight_reports: zero code references; intelligence_embeddings keeps denormalized entity
-- fields and the search_intel RPC reads embeddings only, so RAG over chunks still works.
-- CASCADE drops the intelligence_embeddings.entity_id FK constraint.

DROP TABLE IF EXISTS public.job_preferences CASCADE;
DROP TABLE IF EXISTS public.insight_reports CASCADE;
