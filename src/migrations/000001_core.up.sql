-- FUNCTIONS
-- CREATE OR REPLACE FUNCTION fn_set_created_at() RETURNS TRIGGER AS $$ BEGIN NEW.created_at = NOW();
-- RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
-- AUTOMATE updated_at COLUMNS
CREATE OR REPLACE FUNCTION fn_set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();

RETURN NEW;

END;

$$ LANGUAGE plpgsql;

-- CDC LOGIC
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
    name TEXT,
    handle TEXT,
    user_managed BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CREATE TRIGGER trg_set_group_created_at BEFORE
-- INSERT ON tbl_groups FOR EACH ROW EXECUTE FUNCTION fn_set_created_at();
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
    name TEXT,
    email TEXT UNIQUE,
    attributes JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CREATE TRIGGER trg_set_user_created_at BEFORE
-- INSERT ON tbl_users FOR EACH ROW EXECUTE FUNCTION fn_set_created_at();
CREATE TRIGGER trg_set_user_updated_at BEFORE
UPDATE ON tbl_users FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_user_audit_insert
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON tbl_users FOR EACH ROW EXECUTE FUNCTION fn_insert_audit_log();

-- TBL_GROUP_MEMBER_HISTORY
CREATE TABLE IF NOT EXISTS tbl_group_member_history (
    id SERIAL PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES tbl_groups(id),
    user_id UUID NOT NULL REFERENCES tbl_users(id),
    start_date TIMESTAMP NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP
);

-- TBL_GROUP_MEMBERS
CREATE TABLE IF NOT EXISTS tbl_group_members (
    id SERIAL PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES tbl_groups(id) ON
    DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES tbl_users(id) ON
    DELETE CASCADE,
    start_date TIMESTAMP NOT NULL DEFAULT NOW(),
    historical_id INT NOT NULL REFERENCES tbl_group_member_history(id),
    UNIQUE(group_id, user_id)
);

CREATE TRIGGER trg_group_member_audit_insert
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON tbl_group_members FOR EACH ROW EXECUTE FUNCTION fn_insert_audit_log();

-- TBL_RULES
CREATE TABLE IF NOT EXISTS tbl_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    description TEXT,
    condition JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER trg_set_rule_updated_at BEFORE
UPDATE ON tbl_rules FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_rule_audit_insert
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON tbl_rules FOR EACH ROW EXECUTE FUNCTION fn_insert_audit_log();

-- TBL_RULE_ATTACHMENTS
CREATE TABLE IF NOT EXISTS tbl_rule_attachments (
    id SERIAL PRIMARY KEY,
    -- a group can only appear once in this association, i.e. 1 group cannot have > 1 rule
    group_id UUID UNIQUE NOT NULL REFERENCES tbl_groups(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES tbl_rules(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER trg_set_rule_attachment_updated_at BEFORE
UPDATE ON tbl_rule_attachments FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
