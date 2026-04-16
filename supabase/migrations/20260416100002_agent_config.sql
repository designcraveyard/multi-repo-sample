-- Agent configuration tables for admin panel

CREATE TABLE agent_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  model text DEFAULT 'gpt-4.1-mini',
  system_prompt text,
  temperature float DEFAULT 0.7,
  is_entry_point boolean DEFAULT false,
  is_background boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE tool_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  tool_type text DEFAULT 'function',
  code_ref text,
  parameters_schema jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE agent_tools (
  agent_id uuid REFERENCES agent_configs ON DELETE CASCADE,
  tool_id uuid REFERENCES tool_definitions ON DELETE CASCADE,
  parameter_overrides jsonb,
  PRIMARY KEY (agent_id, tool_id)
);

CREATE TABLE agent_handoffs (
  source_agent_id uuid REFERENCES agent_configs ON DELETE CASCADE,
  target_agent_id uuid REFERENCES agent_configs ON DELETE CASCADE,
  tool_description_override text,
  sort_order int DEFAULT 0,
  PRIMARY KEY (source_agent_id, target_agent_id)
);

CREATE TABLE agent_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number int NOT NULL,
  snapshot jsonb NOT NULL,
  published_at timestamptz DEFAULT now(),
  published_by uuid REFERENCES auth.users ON DELETE SET NULL,
  notes text
);

CREATE TABLE admin_roles (
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id)
);

-- RLS: admin tables use service role key
ALTER TABLE agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users check own admin status" ON admin_roles
  FOR SELECT USING (auth.uid() = user_id);
