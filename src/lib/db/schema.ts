export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('teacher','student','admin')),
  school_id text,
  sso_subject text
);
CREATE TABLE IF NOT EXISTS classes (
  id text PRIMARY KEY,
  teacher_id text NOT NULL REFERENCES users(id),
  name text NOT NULL,
  join_code text NOT NULL UNIQUE,
  active_policy_id text
);
CREATE TABLE IF NOT EXISTS enrollments (
  class_id text NOT NULL REFERENCES classes(id),
  student_id text NOT NULL REFERENCES users(id),
  status text NOT NULL DEFAULT 'active',
  PRIMARY KEY (class_id, student_id)
);
CREATE TABLE IF NOT EXISTS policies (
  id text PRIMARY KEY,
  class_id text NOT NULL REFERENCES classes(id),
  version int NOT NULL,
  json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_id, version)
);
CREATE TABLE IF NOT EXISTS environments (
  id text PRIMARY KEY,
  class_id text NOT NULL REFERENCES classes(id),
  student_id text NOT NULL REFERENCES users(id),
  harness_session_id text,
  sandbox_id text NOT NULL,
  resume_state text,
  status text NOT NULL DEFAULT 'created',
  policy_override_json jsonb,
  last_active_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_id, student_id)
);
CREATE TABLE IF NOT EXISTS turns (
  id text PRIMARY KEY,
  environment_id text NOT NULL REFERENCES environments(id),
  policy_version int NOT NULL,
  prompt text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  model text,
  stop_reason text,
  input_tokens int NOT NULL DEFAULT 0,
  output_tokens int NOT NULL DEFAULT 0,
  flags jsonb NOT NULL DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS events (
  id bigserial PRIMARY KEY,
  environment_id text NOT NULL REFERENCES environments(id),
  turn_id text,
  seq int NOT NULL,
  type text NOT NULL,
  payload jsonb NOT NULL,
  at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS events_env_idx ON events (environment_id, id);
CREATE TABLE IF NOT EXISTS teacher_actions (
  id text PRIMARY KEY,
  environment_id text NOT NULL REFERENCES environments(id),
  teacher_id text NOT NULL,
  action text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS materials (
  id text PRIMARY KEY,
  class_id text NOT NULL REFERENCES classes(id),
  name text NOT NULL,
  storage_key text NOT NULL,
  content text NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS flags (
  id text PRIMARY KEY,
  environment_id text NOT NULL REFERENCES environments(id),
  turn_id text,
  kind text NOT NULL,
  confidence real NOT NULL,
  detail text NOT NULL,
  evidence text NOT NULL,
  resolved boolean NOT NULL DEFAULT false,
  at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS approvals (
  id text PRIMARY KEY,
  environment_id text NOT NULL REFERENCES environments(id),
  turn_id text,
  tool_call_id text NOT NULL,
  tool_name text NOT NULL,
  input jsonb,
  status text NOT NULL DEFAULT 'pending',
  reason text,
  at timestamptz NOT NULL DEFAULT now()
);
`;
