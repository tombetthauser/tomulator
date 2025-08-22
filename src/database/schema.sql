-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    unique_user_string VARCHAR NOT NULL
);

-- Create curator_dialog table
CREATE TABLE IF NOT EXISTS curator_dialog (
    id SERIAL PRIMARY KEY,
    dialog_line VARCHAR NOT NULL,
    context_description VARCHAR NOT NULL,
    is_deleted VARCHAR DEFAULT 'false'
);

-- Create degradations table
CREATE TABLE IF NOT EXISTS degradations (
    id SERIAL PRIMARY KEY,
    start_index INTEGER NOT NULL,
    end_index INTEGER NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nametag VARCHAR NOT NULL,
    donated_string VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create pixel_dust table
CREATE TABLE IF NOT EXISTS pixel_dust (
    id SERIAL PRIMARY KEY,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL
);

-- Insert sample data for users
INSERT INTO users (unique_user_string) VALUES 
    ('user_001'),
    ('user_002'),
    ('user_003')
ON CONFLICT (unique_user_string) DO NOTHING;

-- Insert sample data for curator_dialog
INSERT INTO curator_dialog (dialog_line, context_description, is_deleted) VALUES 
    ('Hello there!', 'Greeting message', 'false'),
    ('How are you?', 'Question about wellbeing', 'false'),
    ('Welcome!', 'Welcome message', 'false')
ON CONFLICT DO NOTHING;

-- Insert sample data for degradations
INSERT INTO degradations (start_index, end_index, user_id) VALUES 
    (0, 100, 1),
    (200, 300, 2),
    (400, 500, 1)
ON CONFLICT DO NOTHING;

-- Insert sample data for donations
INSERT INTO donations (user_id, nametag, donated_string) VALUES 
    (1, 'Supporter1', 'Thank you for the great content!'),
    (2, 'Fan2', 'Keep up the amazing work!'),
    (3, 'Loyal3', 'Love what you do!')
ON CONFLICT DO NOTHING;

-- Insert sample data for pixel_dust
INSERT INTO pixel_dust (x, y) VALUES 
    (100, 200),
    (300, 400),
    (500, 600)
ON CONFLICT DO NOTHING;
