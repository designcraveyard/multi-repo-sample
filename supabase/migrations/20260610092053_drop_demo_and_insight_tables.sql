-- Remove obsolete demo and unused source-document tables (owner decision 2026-06-10).
-- job_preferences: no retained production consumer.
-- insight_reports: zero code references; intelligence_embeddings keeps denormalized entity
-- fields and the search_intel RPC reads embeddings only, so RAG over chunks still works.
-- CASCADE drops the intelligence_embeddings.entity_id FK constraint.

DROP TABLE IF EXISTS public.job_preferences CASCADE;
DROP TABLE IF EXISTS public.insight_reports CASCADE;
