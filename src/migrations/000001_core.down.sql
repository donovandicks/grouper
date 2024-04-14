DROP FUNCTION IF EXISTS fn_set_created_at CASCADE;

DROP FUNCTION IF EXISTS fn_set_updated_at CASCADE;

DROP FUNCTION IF EXISTS fn_insert_audit_log CASCADE;

DROP TRIGGER IF EXISTS trg_set_group_created_at ON tbl_groups CASCADE;

DROP TRIGGER IF EXISTS trg_set_user_created_at ON tbl_users CASCADE;

DROP TRIGGER IF EXISTS trg_set_group_updateed_at ON tbl_groups CASCADE;

DROP TRIGGER IF EXISTS trg_set_user_updated_at ON tbl_users CASCADE;

DROP TRIGGER IF EXISTS trg_group_audit_insert ON tbl_groups CASCADE;

DROP TRIGGER IF EXISTS trg_user_audit_insert ON tbl_users CASCADE;

DROP TABLE IF EXISTS tbl_group_members;

DROP TABLE IF EXISTS tbl_group_member_history;

DROP TABLE IF EXISTS tbl_users;

DROP TABLE IF EXISTS tbl_groups;

DROP TABLE IF EXISTS tbl_audit;
