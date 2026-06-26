-- Remove the OpenAI Agents SDK chat/admin/RAG database surface.
-- Keep Supabase Auth, profiles, and the ai-transform / ai-transcribe Edge Functions.
-- The chat-uploads storage bucket must be removed via the Storage API; Supabase
-- blocks direct deletion from storage schema tables.

-- RAG RPC and source/vector tables.
DROP FUNCTION IF EXISTS public.search_intel(vector, integer, text);
DROP FUNCTION IF EXISTS public.search_intel(vector, int, text);
DROP TABLE IF EXISTS public.intelligence_embeddings CASCADE;
DROP TABLE IF EXISTS public.insight_reports CASCADE;

-- Agent admin/configuration tables.
DROP TABLE IF EXISTS public.agent_tools CASCADE;
DROP TABLE IF EXISTS public.agent_handoffs CASCADE;
DROP TABLE IF EXISTS public.agent_versions CASCADE;
DROP TABLE IF EXISTS public.tool_definitions CASCADE;
DROP TABLE IF EXISTS public.agent_configs CASCADE;
DROP TABLE IF EXISTS public.admin_roles CASCADE;

-- Agent chat, memory, and debug trace tables.
DROP TABLE IF EXISTS public.user_memories CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;
DROP TABLE IF EXISTS public.debug_traces CASCADE;
