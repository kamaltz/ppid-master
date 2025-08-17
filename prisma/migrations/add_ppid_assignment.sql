-- Add PPID assignment fields to requests table
ALTER TABLE requests ADD COLUMN assigned_ppid_id INTEGER;
ALTER TABLE requests ADD CONSTRAINT fk_requests_assigned_ppid FOREIGN KEY (assigned_ppid_id) REFERENCES ppid(id);

-- Add PPID assignment fields to keberatan table  
ALTER TABLE keberatan ADD COLUMN assigned_ppid_id INTEGER;
ALTER TABLE keberatan ADD CONSTRAINT fk_keberatan_assigned_ppid FOREIGN KEY (assigned_ppid_id) REFERENCES ppid(id);

-- Create PPID chat table for inter-PPID communication
CREATE TABLE ppid_chats (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    attachments TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ppid_chats_sender FOREIGN KEY (sender_id) REFERENCES ppid(id),
    CONSTRAINT fk_ppid_chats_receiver FOREIGN KEY (receiver_id) REFERENCES ppid(id)
);