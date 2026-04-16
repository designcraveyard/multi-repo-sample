-- Debug traces for SSE event persistence and debugging

CREATE TABLE debug_traces (
  trace_id text PRIMARY KEY,
  user_id text,
  session_id text,
  started_at timestamptz,
  total_ms int,
  summary jsonb,
  events jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_debug_traces_session ON debug_traces(session_id);
CREATE INDEX idx_debug_traces_user ON debug_traces(user_id);
CREATE INDEX idx_debug_traces_created ON debug_traces(created_at DESC);

ALTER TABLE debug_traces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own traces" ON debug_traces
  FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Service inserts traces" ON debug_traces
  FOR INSERT WITH CHECK (true);
