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
    console.error("Error fetching projects:", projectsError);
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
