-- User memories for cross-session preference tracking

CREATE TABLE user_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  memory_type text NOT NULL CHECK (memory_type IN ('preference', 'requirement', 'context', 'feedback')),
  content text NOT NULL,
  confidence float DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
  source_session_id uuid REFERENCES chat_sessions ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  last_reinforced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content)
);

CREATE INDEX idx_user_memories_active ON user_memories(user_id, is_active) WHERE is_active = true;

ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own memories" ON user_memories
  FOR ALL USING (auth.uid() = user_id);
