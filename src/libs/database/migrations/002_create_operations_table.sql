-- Create operations table
CREATE TABLE IF NOT EXISTS operations (
    operation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    operation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invested_amount DECIMAL(20,8) NOT NULL,
    risky_investment DECIMAL(20,8) NOT NULL,
    non_risky_investment DECIMAL(20,8) NOT NULL,
    log_id UUID,
    status TEXT NOT NULL DEFAULT 'RECOMMENDATION_INIT' CHECK (status IN ('RECOMMENDATION_INIT', 'RECOMMENDATION_FINISHED', 'RECOMMENDATION_FAILED', 'DEPOSIT_INIT', 'DEPOSIT_FAILED', 'ACTIVE_INVESTMENT', 'CLOSED_INVESTMENT')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_operations_user_id ON operations(user_id);
CREATE INDEX IF NOT EXISTS idx_operations_operation_date ON operations(operation_date);
CREATE INDEX IF NOT EXISTS idx_operations_status ON operations(status);
CREATE INDEX IF NOT EXISTS idx_operations_log_id ON operations(log_id);
CREATE INDEX IF NOT EXISTS idx_operations_created_at ON operations(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_operations_updated_at 
    BEFORE UPDATE ON operations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 