-- Create app_readonly role with limited permissions
CREATE ROLE app_readonly WITH LOGIN PASSWORD 'readonly_pass';

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    sensitive_note TEXT
);

-- Grant SELECT permission to app_readonly role
GRANT SELECT ON users TO app_readonly;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO app_readonly;

-- Create a role for full access (for registration in secure app)
CREATE ROLE app_full WITH LOGIN PASSWORD 'full_pass';
GRANT ALL PRIVILEGES ON users TO app_full;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO app_full;

