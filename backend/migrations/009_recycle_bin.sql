CREATE TABLE IF NOT EXISTS recycle_bin (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    entity_name VARCHAR(255) NOT NULL,
    source_dashboard VARCHAR(100) NOT NULL,
    original_data JSONB NOT NULL,
    deleted_by_user_id INTEGER,
    deleted_by_name VARCHAR(150),
    deleted_by_email VARCHAR(150),
    deleted_by_phone VARCHAR(50),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'in_bin',
    restored_at TIMESTAMP WITH TIME ZONE,
    restored_by_user_id INTEGER,
    restored_by_name VARCHAR(150)
);

CREATE INDEX IF NOT EXISTS idx_recycle_bin_status ON recycle_bin(status);
CREATE INDEX IF NOT EXISTS idx_recycle_bin_entity_type ON recycle_bin(entity_type);
CREATE INDEX IF NOT EXISTS idx_recycle_bin_deleted_at ON recycle_bin(deleted_at DESC);
