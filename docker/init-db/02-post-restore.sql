-- MESS WITH THIS ONLY IF YOU KNOW WHAT YOU ARE DOING
-- Post-restore migrations to align dump with Prisma schema
-- This script converts the Spring Boot/JPA dump schema to match the Prisma schema

-- ============================================================
-- STEP 1: Drop conflicting unique constraints
-- (Prisma will recreate them with the correct naming)
-- ============================================================

ALTER TABLE IF EXISTS process DROP CONSTRAINT IF EXISTS process_process_number_key;
ALTER TABLE IF EXISTS tenants DROP CONSTRAINT IF EXISTS tenants_name_key;
ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS roles DROP CONSTRAINT IF EXISTS roles_name_key;
ALTER TABLE IF EXISTS refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_token_key;
ALTER TABLE IF EXISTS process_summary DROP CONSTRAINT IF EXISTS process_summary_process_uuid_key;
ALTER TABLE IF EXISTS process_summary DROP CONSTRAINT IF EXISTS process_summary_process_id_key;

-- ============================================================
-- STEP 2: Convert BigInt IDs to Integer (Prisma uses Int)
-- ============================================================

-- Convert tenants.id from bigint to integer
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'id' AND data_type = 'bigint'
    ) THEN
        ALTER TABLE tenants ALTER COLUMN id TYPE INTEGER;
    END IF;
END $$;

-- Convert roles.id from bigint to integer
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'roles' AND column_name = 'id' AND data_type = 'bigint'
    ) THEN
        ALTER TABLE roles ALTER COLUMN id TYPE INTEGER;
    END IF;
END $$;

-- Convert users.id and users.tenant_id from bigint to integer
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'id' AND data_type = 'bigint'
    ) THEN
        ALTER TABLE users ALTER COLUMN id TYPE INTEGER;
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'tenant_id' AND data_type = 'bigint'
    ) THEN
        ALTER TABLE users ALTER COLUMN tenant_id TYPE INTEGER;
    END IF;
END $$;

-- Convert user_roles from bigint to integer
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_roles' AND column_name = 'user_id' AND data_type = 'bigint'
    ) THEN
        ALTER TABLE user_roles ALTER COLUMN user_id TYPE INTEGER;
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_roles' AND column_name = 'role_id' AND data_type = 'bigint'
    ) THEN
        ALTER TABLE user_roles ALTER COLUMN role_id TYPE INTEGER;
    END IF;
END $$;

-- Convert refresh_tokens from bigint to integer
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'refresh_tokens' AND column_name = 'id' AND data_type = 'bigint'
    ) THEN
        ALTER TABLE refresh_tokens ALTER COLUMN id TYPE INTEGER;
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'refresh_tokens' AND column_name = 'user_id' AND data_type = 'bigint'
    ) THEN
        ALTER TABLE refresh_tokens ALTER COLUMN user_id TYPE INTEGER;
    END IF;
END $$;

-- Convert process_classification.id from bigint to integer
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'process_classification' AND column_name = 'id' AND data_type = 'bigint'
    ) THEN
        ALTER TABLE process_classification ALTER COLUMN id TYPE INTEGER;
    END IF;
END $$;

-- Convert process foreign keys from bigint to integer
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'process' AND column_name = 'classification_id' AND data_type = 'bigint'
    ) THEN
        ALTER TABLE process ALTER COLUMN classification_id TYPE INTEGER;
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'process' AND column_name = 'tenant_id' AND data_type = 'bigint'
    ) THEN
        ALTER TABLE process ALTER COLUMN tenant_id TYPE INTEGER;
    END IF;
END $$;

-- Convert user_interaction_logs from bigint to integer
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_interaction_logs' AND column_name = 'id' AND data_type = 'bigint'
    ) THEN
        ALTER TABLE user_interaction_logs ALTER COLUMN id TYPE INTEGER;
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_interaction_logs' AND column_name = 'user_id' AND data_type = 'bigint'
    ) THEN
        ALTER TABLE user_interaction_logs ALTER COLUMN user_id TYPE INTEGER;
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_interaction_logs' AND column_name = 'tenant_id' AND data_type = 'bigint'
    ) THEN
        ALTER TABLE user_interaction_logs ALTER COLUMN tenant_id TYPE INTEGER;
    END IF;
END $$;

-- ============================================================
-- STEP 3: Drop columns that no longer exist in Prisma schema
-- ============================================================

-- Drop _en columns from process_classification (English translations removed)
ALTER TABLE IF EXISTS process_classification DROP COLUMN IF EXISTS category_en;
ALTER TABLE IF EXISTS process_classification DROP COLUMN IF EXISTS name_en;
ALTER TABLE IF EXISTS process_classification DROP COLUMN IF EXISTS sub_category_en;

-- Drop Spring Boot's flyway migration history table
DROP TABLE IF EXISTS flyway_schema_history;

-- ============================================================
-- STEP 4: Column renames (process_uuid -> process_id)
-- ============================================================

-- Rename process_uuid to process_id in on_going_list
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'on_going_list' AND column_name = 'process_uuid') THEN
        ALTER TABLE on_going_list RENAME COLUMN process_uuid TO process_id;
    END IF;
END $$;

-- Rename process_uuid to process_id in process_summary
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'process_summary' AND column_name = 'process_uuid') THEN
        ALTER TABLE process_summary RENAME COLUMN process_uuid TO process_id;
    END IF;
END $$;

-- Rename process_uuid to process_id in protocols
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'protocols' AND column_name = 'process_uuid') THEN
        ALTER TABLE protocols RENAME COLUMN process_uuid TO process_id;
    END IF;
END $$;

-- Create user_access_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_access_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    ip_address VARCHAR(45),
    user_agent TEXT,
    logged_in_at TIMESTAMP WITH TIME ZONE NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME zone DEFAULT now()
);

-- Add interaction_type as enum if the column type is wrong
DO $$
BEGIN
    -- Check if InteractionType enum exists, create if not
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InteractionType') THEN
        CREATE TYPE "InteractionType" AS ENUM (
            'CHAT_MESSAGE',
            'THREAD_CREATED',
            'PROCESS_VIEW',
            'PROCESS_SEARCH',
            'DOCUMENT_DOWNLOAD',
            'LOGIN',
            'LOGOUT',
            'OTHER'
        );
    END IF;
END $$;

-- If user_interaction_logs.interaction_type is varchar, convert to enum
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_interaction_logs'
        AND column_name = 'interaction_type'
        AND data_type = 'character varying'
    ) THEN
        -- Add temp column, copy data, drop old, rename new
        ALTER TABLE user_interaction_logs ADD COLUMN interaction_type_new "InteractionType";
        UPDATE user_interaction_logs SET interaction_type_new = interaction_type::"InteractionType" WHERE interaction_type IS NOT NULL;
        ALTER TABLE user_interaction_logs DROP COLUMN interaction_type;
        ALTER TABLE user_interaction_logs RENAME COLUMN interaction_type_new TO interaction_type;
    END IF;
END $$;

-- Ensure daily_bot_logs table exists
CREATE TABLE IF NOT EXISTS daily_bot_logs (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    number_of_updates INTEGER NOT NULL DEFAULT 0
);

-- Migrate interested_parties from separate table to array column on process
DO $$
BEGIN
    -- Add interested_parties column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'process' AND column_name = 'interested_parties'
    ) THEN
        ALTER TABLE process ADD COLUMN interested_parties TEXT[] DEFAULT '{}';
    END IF;

    -- Migrate data from process_interested_parties table to the array column
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'process_interested_parties') THEN
        UPDATE process p
        SET interested_parties = COALESCE(
            (SELECT ARRAY_AGG(pip.party)
             FROM process_interested_parties pip
             WHERE pip.process_id = p.id),
            '{}'
        );

        -- Drop the old table after migration
        DROP TABLE process_interested_parties;
        RAISE NOTICE 'Migrated interested_parties from table to array column';
    END IF;
END $$;

DO $$ BEGIN RAISE NOTICE 'Post-restore migrations completed successfully.'; END $$;
