-- Create operations_logs table
CREATE TABLE IF NOT EXISTS operations_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID NOT NULL,
    description TEXT NOT NULL,
    create_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    step_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (operation_id) REFERENCES operations(operation_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_operations_logs_operation_id ON operations_logs(operation_id);
CREATE INDEX IF NOT EXISTS idx_operations_logs_create_date ON operations_logs(create_date);
CREATE INDEX IF NOT EXISTS idx_operations_logs_step_number ON operations_logs(step_number);
CREATE INDEX IF NOT EXISTS idx_operations_logs_created_at ON operations_logs(created_at);

-- Create unique constraint to ensure step_number is unique per operation
CREATE UNIQUE INDEX IF NOT EXISTS idx_operations_logs_operation_step_unique 
    ON operations_logs(operation_id, step_number); 