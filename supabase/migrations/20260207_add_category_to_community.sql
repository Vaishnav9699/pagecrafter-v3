-- Add category field to community_projects for template filtering
ALTER TABLE public.community_projects 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_community_projects_category ON public.community_projects(category);
CREATE INDEX IF NOT EXISTS idx_community_projects_is_template ON public.community_projects(is_template);

-- Add teams table for collaboration
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add team members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(team_id, user_id)
);

-- Add community chat table
CREATE TABLE IF NOT EXISTS public.community_chat (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_chat ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Anyone can view teams"
    ON public.teams
    FOR SELECT
    USING (true);

CREATE POLICY "Users can create teams"
    ON public.teams
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners can update their teams"
    ON public.teams
    FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Team owners can delete their teams"
    ON public.teams
    FOR DELETE
    USING (auth.uid() = owner_id);

-- Team members policies
CREATE POLICY "Anyone can view team members"
    ON public.team_members
    FOR SELECT
    USING (true);

CREATE POLICY "Team owners can add members"
    ON public.team_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.teams
            WHERE id = team_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can leave teams"
    ON public.team_members
    FOR DELETE
    USING (auth.uid() = user_id);

-- Community chat policies
CREATE POLICY "Anyone can view chat messages"
    ON public.community_chat
    FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can send messages"
    ON public.community_chat
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON public.teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_chat_created_at ON public.community_chat(created_at DESC);
