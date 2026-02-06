import { supabase, DbProject, DbMessage, DbProjectFile } from "./supabase";

// Project interface matching the frontend expectations
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  lastGeneratedCode?: { html: string; css: string; js: string };
  files: ProjectFile[];
}

export interface ProjectFile {
  id: string;
  name: string;
  content: string;
  type: "html" | "css" | "js";
  createdAt: Date;
}

// Get current user ID
async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// Convert DB project to frontend project format
function dbProjectToProject(
  dbProject: DbProject,
  messages: DbMessage[] = [],
  files: DbProjectFile[] = [],
): Project {
  return {
    id: dbProject.id,
    name: dbProject.name,
    description: dbProject.description || undefined,
    createdAt: new Date(dbProject.created_at),
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    lastGeneratedCode: dbProject.last_generated_html
      ? {
        html: dbProject.last_generated_html || "",
        css: dbProject.last_generated_css || "",
        js: dbProject.last_generated_js || "",
      }
      : undefined,
    files: files.map((f) => ({
      id: f.id,
      name: f.name,
      content: f.content || "",
      type: f.type,
      createdAt: new Date(f.created_at),
    })),
  };
}

// Fetch all projects for the current user with their messages and files
export async function getProjects(): Promise<Project[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.error("User not authenticated");
    return [];
  }

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (projectsError) {
    console.error(
      "Error fetching projects:",
      projectsError.message,
      projectsError.code,
      projectsError.details,
    );
    return [];
  }

  if (!projects || projects.length === 0) {
    return [];
  }

  // Fetch all messages and files for all projects
  const projectIds = projects.map((p) => p.id);

  const { data: allMessages } = await supabase
    .from("messages")
    .select("*")
    .in("project_id", projectIds)
    .order("created_at", { ascending: true });

  const { data: allFiles } = await supabase
    .from("project_files")
    .select("*")
    .in("project_id", projectIds)
    .order("created_at", { ascending: true });

  // Group messages and files by project_id
  const messagesByProject: Record<string, DbMessage[]> = {};
  const filesByProject: Record<string, DbProjectFile[]> = {};

  (allMessages || []).forEach((m) => {
    if (!messagesByProject[m.project_id]) {
      messagesByProject[m.project_id] = [];
    }
    messagesByProject[m.project_id].push(m);
  });

  (allFiles || []).forEach((f) => {
    if (!filesByProject[f.project_id]) {
      filesByProject[f.project_id] = [];
    }
    filesByProject[f.project_id].push(f);
  });

  return projects.map((p) =>
    dbProjectToProject(
      p,
      messagesByProject[p.id] || [],
      filesByProject[p.id] || [],
    ),
  );
}

// Create a new project for the current user
export async function createProject(
  name: string,
  description?: string,
): Promise<Project | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.error("User not authenticated");
    return null;
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({ name, description: description || null, user_id: userId })
    .select()
    .single();

  if (error) {
    console.error("Error creating project:", error);
    return null;
  }

  return dbProjectToProject(data, [], []);
}

// Update project details
export async function updateProject(
  id: string,
  updates: { name?: string; description?: string },
): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.error("User not authenticated");
    return false;
  }

  const { error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating project:", error);
    return false;
  }

  return true;
}

// Update project's generated code
export async function updateProjectCode(
  id: string,
  code: { html: string; css: string; js: string },
): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.error("User not authenticated");
    return false;
  }

  const { error } = await supabase
    .from("projects")
    .update({
      last_generated_html: code.html,
      last_generated_css: code.css,
      last_generated_js: code.js,
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating project code:", error);
    return false;
  }

  return true;
}

// Delete a project (messages and files cascade delete)
export async function deleteProject(id: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.error("User not authenticated");
    return false;
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting project:", error);
    return false;
  }

  return true;
}

// Add a message to a project
export async function addMessage(
  projectId: string,
  role: "user" | "assistant",
  content: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("messages")
    .insert({ project_id: projectId, role, content });

  if (error) {
    console.error("Error adding message:", error);
    return false;
  }

  return true;
}

// Add multiple messages to a project (for bulk updates)
export async function addMessages(
  projectId: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<boolean> {
  const { error } = await supabase.from("messages").insert(
    messages.map((m) => ({
      project_id: projectId,
      role: m.role,
      content: m.content,
    })),
  );

  if (error) {
    console.error("Error adding messages:", error);
    return false;
  }

  return true;
}

// Get messages for a project
export async function getProjectMessages(
  projectId: string,
): Promise<Array<{ role: "user" | "assistant"; content: string }>> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return (data || []).map((m) => ({ role: m.role, content: m.content }));
}

// Clear all messages for a project and add new ones
export async function replaceProjectMessages(
  projectId: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<boolean> {
  // Delete existing messages
  const { error: deleteError } = await supabase
    .from("messages")
    .delete()
    .eq("project_id", projectId);

  if (deleteError) {
    console.error("Error deleting messages:", deleteError);
    return false;
  }

  // Insert new messages if any
  if (messages.length > 0) {
    const { error: insertError } = await supabase.from("messages").insert(
      messages.map((m) => ({
        project_id: projectId,
        role: m.role,
        content: m.content,
      })),
    );

    if (insertError) {
      console.error("Error inserting messages:", insertError);
      return false;
    }
  }

  return true;
}

// =============================================
// COMMUNITY PROJECTS OPERATIONS
// =============================================

export interface CommunityProject {
  id: string;
  userId: string;
  authorName: string;
  projectName: string;
  description: string;
  code: { html: string; css: string; js: string };
  likes: number;
  remixes: number;
  createdAt: Date;
}

// Fetch all community projects (visible to all users)
export async function getCommunityProjects(): Promise<CommunityProject[]> {
  const { data, error } = await supabase
    .from("community_projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching community projects:", error);
    return [];
  }

  return (data || []).map((p) => ({
    id: p.id,
    userId: p.user_id,
    authorName: p.author_name,
    projectName: p.project_name,
    description: p.description || "A project created with PageCrafter AI",
    code: {
      html: p.html_code || "",
      css: p.css_code || "",
      js: p.js_code || "",
    },
    likes: p.likes || 0,
    remixes: p.remixes || 0,
    createdAt: new Date(p.created_at),
  }));
}

// Publish a project to the community
export async function publishToCommunity(
  projectName: string,
  description: string,
  code: { html: string; css: string; js: string },
  authorName: string
): Promise<CommunityProject | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.error("User not authenticated");
    return null;
  }

  const { data, error } = await supabase
    .from("community_projects")
    .insert({
      user_id: userId,
      author_name: authorName,
      project_name: projectName,
      description: description || null,
      html_code: code.html,
      css_code: code.css,
      js_code: code.js,
      likes: 0,
      remixes: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Error publishing to community:", error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    authorName: data.author_name,
    projectName: data.project_name,
    description: data.description || "A project created with PageCrafter AI",
    code: {
      html: data.html_code || "",
      css: data.css_code || "",
      js: data.js_code || "",
    },
    likes: data.likes || 0,
    remixes: data.remixes || 0,
    createdAt: new Date(data.created_at),
  };
}

// Like a community project
export async function likeCommunityProject(projectId: string): Promise<boolean> {
  const { data: currentData, error: fetchError } = await supabase
    .from("community_projects")
    .select("likes")
    .eq("id", projectId)
    .single();

  if (fetchError) {
    console.error("Error fetching project likes:", fetchError);
    return false;
  }

  const { error } = await supabase
    .from("community_projects")
    .update({ likes: (currentData?.likes || 0) + 1 })
    .eq("id", projectId);

  if (error) {
    console.error("Error liking project:", error);
    return false;
  }

  return true;
}

// Increment remix count
export async function incrementRemixCount(projectId: string): Promise<boolean> {
  const { data: currentData, error: fetchError } = await supabase
    .from("community_projects")
    .select("remixes")
    .eq("id", projectId)
    .single();

  if (fetchError) {
    console.error("Error fetching project remixes:", fetchError);
    return false;
  }

  const { error } = await supabase
    .from("community_projects")
    .update({ remixes: (currentData?.remixes || 0) + 1 })
    .eq("id", projectId);

  if (error) {
    console.error("Error incrementing remix count:", error);
    return false;
  }

  return true;
}

// Delete a community project (only owner can delete)
export async function deleteCommunityProject(projectId: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.error("User not authenticated");
    return false;
  }

  const { error } = await supabase
    .from("community_projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting community project:", error);
    return false;
  }

  return true;
}

// =====================
// User Settings Operations
// =====================

// Get user's API key from database
export async function getUserApiKey(): Promise<string | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("gemini_api_key")
    .eq("user_id", userId)
    .single();

  if (error) {
    // No settings found is not an error
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error("Error fetching user API key:", error);
    return null;
  }

  return data?.gemini_api_key || null;
}

// Save user's API key to database
export async function saveUserApiKey(apiKey: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.error("User not authenticated");
    return false;
  }

  // Upsert - insert or update if exists
  const { error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: userId,
      gemini_api_key: apiKey,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error("Error saving user API key:", error);
    return false;
  }

  return true;
}

// Delete user's API key from database
export async function deleteUserApiKey(): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return false;
  }

  const { error } = await supabase
    .from("user_settings")
    .update({ gemini_api_key: null, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting user API key:", error);
    return false;
  }

  return true;
}
