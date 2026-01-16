-- ============================================
-- PageCrafter Database Schema with Authentication
-- ============================================
-- Run this in your Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Drop existing tables if they exist (be careful in production!)
-- ============================================
DROP TABLE IF EXISTS project_files CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- ============================================
-- Projects table (user-scoped)
-- ============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_generated_html TEXT,
    last_generated_css TEXT,
    last_generated_js TEXT
);

-- ============================================
-- Messages table (chat history)
-- ============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Project files table
-- ============================================
CREATE TABLE project_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    content TEXT,
    type TEXT NOT NULL CHECK (type IN ('html', 'css', 'js')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Create indexes for better query performance
-- ============================================
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_messages_project_id ON messages(project_id);
CREATE INDEX idx_project_files_project_id ON project_files(project_id);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for Projects
-- Users can only see/manage their own projects
-- ============================================
CREATE POLICY "Users can view their own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- RLS Policies for Messages
-- Users can only access messages of their own projects
-- ============================================
CREATE POLICY "Users can view messages of their projects"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = messages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their projects"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = messages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages in their projects"
    ON messages FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = messages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- ============================================
-- RLS Policies for Project Files
-- Users can only access files of their own projects
-- ============================================
CREATE POLICY "Users can view files of their projects"
    ON project_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_files.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create files in their projects"
    ON project_files FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_files.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update files in their projects"
    ON project_files FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_files.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete files in their projects"
    ON project_files FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_files.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- ============================================
-- Done! Your database is now ready.
-- ============================================
