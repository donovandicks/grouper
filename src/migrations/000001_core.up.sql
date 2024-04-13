-- FUNCTIONS
CREATE OR REPLACE FUNCTION fn_set_created_at() RETURNS TRIGGER AS $$ BEGIN NEW.created_at = NOW();

RETURN NEW;

END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();

RETURN NEW;

END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_insert_audit_log() RETURNS TRIGGER AS $$
DECLARE audit_row_data JSONB;

BEGIN audit_row_data := jsonb_build_object('old', to_json(OLD), 'new', to_json(NEW));

INSERT INTO tbl_audit (event, table_name, row_data)
VALUES (TG_OP, TG_TABLE_NAME, audit_row_data);

RETURN NEW;

END;

$$ LANGUAGE plpgsql;

-- TBL_AUDIT
CREATE TABLE tbl_audit (
    id SERIAL PRIMARY KEY,
    event TEXT,
    table_name TEXT,
    row_data JSONB,
    event_time TIMESTAMP DEFAULT NOW(),
    db_user TEXT DEFAULT current_user
);

-- TBL_GROUPS
CREATE TABLE IF NOT EXISTS tbl_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    NAME TEXT,
    handle TEXT,
    group_type TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER trg_set_group_created_at BEFORE
INSERT ON tbl_groups FOR EACH ROW EXECUTE FUNCTION fn_set_created_at();

CREATE TRIGGER trg_set_group_updated_at BEFORE
UPDATE ON tbl_groups FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_group_audit_insert
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON tbl_groups FOR EACH ROW EXECUTE FUNCTION fn_insert_audit_log();

-- TBL_USERS
CREATE TABLE IF NOT EXISTS tbl_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    NAME TEXT,
    email TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER trg_set_user_created_at BEFORE
INSERT ON tbl_users FOR EACH ROW EXECUTE FUNCTION fn_set_created_at();

CREATE TRIGGER trg_set_user_updated_at BEFORE
UPDATE ON tbl_users FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_user_audit_insert
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON tbl_users FOR EACH ROW EXECUTE FUNCTION fn_insert_audit_log();

-- TBL_GROUP_MEMBERS
CREATE TABLE IF NOT EXISTS tbl_group_members (
    id SERIAL PRIMARY KEY,
    group_id UUID REFERENCES tbl_groups(id) ON
    DELETE CASCADE,
    user_id UUID REFERENCES tbl_users(id) ON
    DELETE CASCADE,
    start_date TIMESTAMP DEFAULT NOW(),
    end_date TIMESTAMP,
    UNIQUE(group_id, user_id)
);

CREATE TRIGGER trg_group_member_audit_insert
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON tbl_group_members FOR EACH ROW EXECUTE FUNCTION fn_insert_audit_log();

-- TBL_GROUP_HISTORY
CREATE TYPE TYPE_GROUP_EVENT AS ENUM (
    'GROUP_CREATE',
    'GROUP_UPDATE',
    'GROUP_DELETE',
    'GROUP_MEMBER_ADD',
    'GROUP_MEMBER_REMOVE'
);

CREATE TABLE IF NOT EXISTS tbl_group_history (
    id SERIAL PRIMARY KEY,
    group_id UUID REFERENCES tbl_groups(id),
    event TYPE_GROUP_EVENT NOT NULL,
    event_time TIMESTAMP DEFAULT NOW(),
    data JSONB
);
