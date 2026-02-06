-- Create the community_projects table
CREATE TABLE IF NOT EXISTS public.community_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    author_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    description TEXT,
    html_code TEXT NOT NULL DEFAULT '',
    css_code TEXT NOT NULL DEFAULT '',
    js_code TEXT NOT NULL DEFAULT '',
    likes INTEGER DEFAULT 0,
    remixes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.community_projects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read community projects (public visibility)
CREATE POLICY "Anyone can view community projects"
    ON public.community_projects
    FOR SELECT
    USING (true);

-- Policy: Authenticated users can insert their own projects
CREATE POLICY "Users can publish their projects"
    ON public.community_projects
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own projects
CREATE POLICY "Users can update their own projects"
    ON public.community_projects
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can only delete their own projects
CREATE POLICY "Users can delete their own projects"
    ON public.community_projects
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_community_projects_created_at ON public.community_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_projects_user_id ON public.community_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_community_projects_likes ON public.community_projects(likes DESC);
