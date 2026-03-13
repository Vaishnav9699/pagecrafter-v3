-- ============================================
-- PageCrafter Database Schema (Unified with Chai Builder)
-- ============================================
-- Copy this ENTIRE file and run it in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Option to clean up before deploying (Uncomment the drops if you need to wipe out the broken tables)
-- BE CAREFUL! THIS WILL DELETE ANY EXISTING DATA ON THESE TABLES!
-- DROP TABLE IF EXISTS public.community_chat CASCADE;
-- DROP TABLE IF EXISTS public.team_members CASCADE;
-- DROP TABLE IF EXISTS public.teams CASCADE;
-- DROP TABLE IF EXISTS public.user_settings CASCADE;
-- DROP TABLE IF EXISTS public.community_projects CASCADE;
-- DROP TABLE IF EXISTS public.project_files CASCADE;
-- DROP TABLE IF EXISTS public.messages CASCADE;
-- DROP TABLE IF EXISTS public.projects CASCADE;

-- 1. Create Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  last_generated_html text,
  last_generated_css text,
  last_generated_js text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Create Project Files Table
CREATE TABLE IF NOT EXISTS public.project_files (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  content text,
  type text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. Create Community Projects Table
CREATE TABLE IF NOT EXISTS public.community_projects (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  project_name text NOT NULL,
  description text,
  html_code text,
  css_code text,
  js_code text,
  likes integer DEFAULT 0,
  remixes integer DEFAULT 0,
  category text,
  is_template boolean DEFAULT false,
  thumbnail_url text,
  tags text[],
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 5. Create User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  gemini_api_key text,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 6. Create Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 7. Create Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  joined_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 8. Create Community Chat Table
CREATE TABLE IF NOT EXISTS public.community_chat (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_chat ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Create RLS Policies
-- ============================================

-- Projects Policies
CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Project Files Policies
CREATE POLICY "Users can view their own files" ON public.project_files FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects WHERE public.projects.id = project_id AND public.projects.user_id = auth.uid()));
CREATE POLICY "Users can insert their own files" ON public.project_files FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE public.projects.id = project_id AND public.projects.user_id = auth.uid()));
CREATE POLICY "Users can update their own files" ON public.project_files FOR UPDATE USING (EXISTS (SELECT 1 FROM public.projects WHERE public.projects.id = project_id AND public.projects.user_id = auth.uid()));
CREATE POLICY "Users can delete their own files" ON public.project_files FOR DELETE USING (EXISTS (SELECT 1 FROM public.projects WHERE public.projects.id = project_id AND public.projects.user_id = auth.uid()));

-- Messages Policies
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects WHERE public.projects.id = project_id AND public.projects.user_id = auth.uid()));
CREATE POLICY "Users can insert their own messages" ON public.messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE public.projects.id = project_id AND public.projects.user_id = auth.uid()));
CREATE POLICY "Users can update their own messages" ON public.messages FOR UPDATE USING (EXISTS (SELECT 1 FROM public.projects WHERE public.projects.id = project_id AND public.projects.user_id = auth.uid()));
CREATE POLICY "Users can delete their own messages" ON public.messages FOR DELETE USING (EXISTS (SELECT 1 FROM public.projects WHERE public.projects.id = project_id AND public.projects.user_id = auth.uid()));

-- Community Projects Policies
CREATE POLICY "Anyone can read community projects" ON public.community_projects FOR SELECT USING (true);
CREATE POLICY "Users can insert community projects" ON public.community_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can update community projects (for likes/remixes)" ON public.community_projects FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own community projects" ON public.community_projects FOR DELETE USING (auth.uid() = user_id);

-- User Settings Policies
CREATE POLICY "Users can manage their own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

-- Teams Policies
CREATE POLICY "Users can manage teams they own" ON public.teams FOR ALL USING (auth.uid() = owner_id);

-- Team Members Policies
CREATE POLICY "Users can see team members" ON public.team_members FOR SELECT USING (EXISTS (SELECT 1 FROM public.teams WHERE public.teams.id = team_id AND public.teams.owner_id = auth.uid()) OR user_id = auth.uid());
CREATE POLICY "Team owners can manage members" ON public.team_members FOR ALL USING (EXISTS (SELECT 1 FROM public.teams WHERE public.teams.id = team_id AND public.teams.owner_id = auth.uid()));

-- Community Chat Policies
CREATE POLICY "Anyone can read community chat" ON public.community_chat FOR SELECT USING (true);
CREATE POLICY "Users can insert community chat" ON public.community_chat FOR INSERT WITH CHECK (auth.uid() = user_id);
