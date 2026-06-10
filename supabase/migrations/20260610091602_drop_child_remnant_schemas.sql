-- Remove schema remnants left by child apps and an abandoned first-gen chat.
-- Verified 2026-06-10: zero code references in any repo; all tables empty except
-- food_serving_units (11 generic seed rows, no user data). fit-chat now runs on
-- its own Supabase project; first-gen chat was superseded by chat_sessions/chat_messages.
-- (Empty buckets body-log-photos / reflection-photos removed via Storage API, not SQL.)

-- fit-chat fitness/nutrition remnants (10 tables)
DROP TABLE IF EXISTS public.recipe_ingredients CASCADE;
DROP TABLE IF EXISTS public.food_serving_units CASCADE;
DROP TABLE IF EXISTS public.recipes CASCADE;
DROP TABLE IF EXISTS public.food_items CASCADE;
DROP TABLE IF EXISTS public.workout_logs CASCADE;
DROP TABLE IF EXISTS public.routines CASCADE;
DROP TABLE IF EXISTS public.exercises CASCADE;
DROP TABLE IF EXISTS public.user_goals CASCADE;
DROP TABLE IF EXISTS public.reflections CASCADE;
DROP TABLE IF EXISTS public.body_logs CASCADE;

-- first-gen chat remnants (superseded by chat_sessions/chat_messages)
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- orphaned functions belonging to the dropped schemas
DROP FUNCTION IF EXISTS public.match_food_items(vector, double precision, integer);
DROP FUNCTION IF EXISTS public.match_recipes(vector, double precision, integer);
DROP FUNCTION IF EXISTS public.update_conversation_timestamp();
DROP FUNCTION IF EXISTS public.touch_conversation_on_message();

-- orphaned enum types from the fitness schema
DROP TYPE IF EXISTS public.exercise_category;
DROP TYPE IF EXISTS public.exercise_equipment;
DROP TYPE IF EXISTS public.exercise_force;
DROP TYPE IF EXISTS public.exercise_level;
DROP TYPE IF EXISTS public.exercise_mechanic;
DROP TYPE IF EXISTS public.muscle_group;
