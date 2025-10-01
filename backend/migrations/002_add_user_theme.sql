-- Add theme column to users table
ALTER TABLE users ADD COLUMN theme VARCHAR(10) DEFAULT 'system';

-- Update existing users to have default theme
UPDATE users SET theme = 'system' WHERE theme IS NULL;
