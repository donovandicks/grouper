import { MigrationBuilder } from "node-pg-migrate";

export const up = (pgm: MigrationBuilder) => {
  pgm.sql(`
-- FUNCTIONS

CREATE OR REPLACE FUNCTION set_created_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TBL_GROUPS

CREATE TABLE IF NOT EXISTS tbl_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  handle TEXT,
  created_at TIMESTAMP
);

CREATE TRIGGER set_group_created_at_trigger
BEFORE INSERT ON tbl_groups
FOR EACH ROW
EXECUTE FUNCTION set_created_at();

-- TBL_USERS

CREATE TABLE IF NOT EXISTS tbl_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE,
  created_at TIMESTAMP
);

CREATE TRIGGER set_user_created_at_trigger
BEFORE INSERT ON tbl_users
FOR EACH ROW
EXECUTE FUNCTION set_created_at();

-- TBL_GROUP_MEMBERS

CREATE TABLE IF NOT EXISTS tbl_group_members (
  id SERIAL PRIMARY KEY,
  group_id UUID REFERENCES tbl_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES tbl_users(id) ON DELETE CASCADE,
  UNIQUE(group_id, user_id)
);
  `);
};

export const down = (pgm: MigrationBuilder) => {
  pgm.sql(`
DROP FUNCTION IF EXISTS set_created_at();
DROP TABLE IF EXISTS tbl_group_members;
DROP TABLE IF EXISTS tbl_groups;
DROP TABLE IF EXISTS tbl_users;
  `);
};
