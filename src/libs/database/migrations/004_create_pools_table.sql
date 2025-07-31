-- Create pools table
CREATE TABLE IF NOT EXISTS pools (
    id SERIAL,
    pool_id TEXT PRIMARY KEY,
    pool_info JSONB NOT NULL,
    token_quality JSONB NOT NULL,
    impermanent_loss JSONB NOT NULL,
    token_correlation JSONB NOT NULL,
    tokens_volatility JSONB NOT NULL,
    pool_growth_tendency JSONB NOT NULL,
    apy_volatility JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pools_pool_id ON pools(pool_id);
CREATE INDEX IF NOT EXISTS idx_pools_updated_at ON pools(updated_at);
CREATE INDEX IF NOT EXISTS idx_pools_pool_info_gin ON pools USING GIN(pool_info);
CREATE INDEX IF NOT EXISTS idx_pools_token_quality_gin ON pools USING GIN(token_quality);
CREATE INDEX IF NOT EXISTS idx_pools_impermanent_loss_gin ON pools USING GIN(impermanent_loss);
CREATE INDEX IF NOT EXISTS idx_pools_token_correlation_gin ON pools USING GIN(token_correlation);
CREATE INDEX IF NOT EXISTS idx_pools_tokens_volatility_gin ON pools USING GIN(tokens_volatility);
CREATE INDEX IF NOT EXISTS idx_pools_pool_growth_tendency_gin ON pools USING GIN(pool_growth_tendency);
CREATE INDEX IF NOT EXISTS idx_pools_apy_volatility_gin ON pools USING GIN(apy_volatility);

-- Create indexes for JSONB field queries
CREATE INDEX IF NOT EXISTS idx_pools_token0_id ON pools USING GIN((pool_info->'token0'->>'id'));
CREATE INDEX IF NOT EXISTS idx_pools_token1_id ON pools USING GIN((pool_info->'token1'->>'id'));
CREATE INDEX IF NOT EXISTS idx_pools_fee_tier ON pools USING GIN((pool_info->>'feeTier'));
CREATE INDEX IF NOT EXISTS idx_pools_total_value_locked ON pools USING GIN((pool_info->>'totalValueLockedUSD'));

-- Create trigger for updated_at
CREATE TRIGGER update_pools_updated_at 
    BEFORE UPDATE ON pools 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 