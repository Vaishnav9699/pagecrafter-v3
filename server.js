const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "pagecrafter_db",
  password: "radhey123",
  port: 5432,
});

// ----------------------------
// Health Check
// ----------------------------
app.get("/", (req, res) => {
  res.send("PageCrafter Backend Running...");
});

// =====================================================
// USERS CRUD
// =====================================================

// CREATE USER
app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1,$2) RETURNING *",
      [name, email]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error inserting user");
  }
});

// GET ALL USERS
app.get("/users", async (req, res) => {
  const result = await pool.query("SELECT * FROM users");
  res.json(result.rows);
});

// UPDATE USER
app.put("/users/:id", async (req, res) => {
  const userId = req.params.id;
  const { name, email } = req.body;

  try {
    const result = await pool.query(
      "UPDATE users SET name=$1, email=$2 WHERE user_id=$3 RETURNING *",
      [name, email, userId]
    );

    if (!result.rows.length) return res.status(404).send("User not found");
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error updating user");
  }
});

// DELETE USER
app.delete("/users/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    await pool.query("DELETE FROM users WHERE user_id=$1", [userId]);
    res.send("User deleted");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting user");
  }
});

// =====================================================
// PROJECT CRUD
// =====================================================

// CREATE PROJECT
app.post("/projects", async (req, res) => {
  const { user_id, title, description } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO projects (user_id, title, description) VALUES ($1,$2,$3) RETURNING *",
      [user_id, title, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating project");
  }
});

// GET PROJECTS OF USER
app.get("/projects/:userId", async (req, res) => {
  const userId = req.params.userId;

  const result = await pool.query(
    "SELECT * FROM projects WHERE user_id=$1 ORDER BY project_id DESC",
    [userId]
  );
  res.json(result.rows);
});

// UPDATE PROJECT
app.put("/projects/:projectId", async (req, res) => {
  const projectId = req.params.projectId;
  const { title, description } = req.body;

  try {
    const result = await pool.query(
      "UPDATE projects SET title=$1, description=$2 WHERE project_id=$3 RETURNING *",
      [title, description, projectId]
    );

    if (!result.rows.length) return res.status(404).send("Project not found");
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error updating project");
  }
});

// DELETE PROJECT
app.delete("/projects/:projectId", async (req, res) => {
  const projectId = req.params.projectId;
  try {
    await pool.query("DELETE FROM projects WHERE project_id=$1", [projectId]);
    res.send("Project deleted");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting project");
  }
});

// =====================================================
// PAGES CRUD
// =====================================================

// CREATE PAGE
app.post("/projects/:projectId/pages", async (req, res) => {
  const projectId = req.params.projectId;
  const { page_name, page_route } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO project_pages (project_id, page_name, page_route) VALUES ($1,$2,$3) RETURNING *",
      [projectId, page_name, page_route]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating page");
  }
});

// GET PAGES OF PROJECT
app.get("/projects/:projectId/pages", async (req, res) => {
  const projectId = req.params.projectId;

  const result = await pool.query(
    "SELECT * FROM project_pages WHERE project_id=$1",
    [projectId]
  );
  res.json(result.rows);
});

// UPDATE PAGE
app.put("/pages/:pageId", async (req, res) => {
  const pageId = req.params.pageId;
  const { page_name, page_route } = req.body;

  try {
    const result = await pool.query(
      "UPDATE project_pages SET page_name=$1, page_route=$2 WHERE page_id=$3 RETURNING *",
      [page_name, page_route, pageId]
    );

    if (!result.rows.length) return res.status(404).send("Page not found");
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error updating page");
  }
});

// DELETE PAGE
app.delete("/pages/:pageId", async (req, res) => {
  const pageId = req.params.pageId;

  try {
    await pool.query("DELETE FROM project_pages WHERE page_id=$1", [pageId]);
    res.send("Page deleted");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting page");
  }
});

// =====================================================
// COMPONENT CRUD
// =====================================================

// CREATE COMPONENT
app.post("/pages/:pageId/components", async (req, res) => {
  const { type, content_json, position_x, position_y, order_index } = req.body;
  const pageId = req.params.pageId;

  try {
    const result = await pool.query(
      `INSERT INTO page_components 
       (page_id, type, content_json, position_x, position_y, order_index)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        pageId,
        type,
        JSON.stringify(content_json),
        position_x,
        position_y,
        order_index,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error adding component");
  }
});

// GET COMPONENTS OF PAGE
app.get("/pages/:pageId/components", async (req, res) => {
  const pageId = req.params.pageId;

  const result = await pool.query(
    "SELECT * FROM page_components WHERE page_id=$1 ORDER BY order_index ASC",
    [pageId]
  );
  res.json(result.rows);
});

// UPDATE COMPONENT
app.put("/components/:id", async (req, res) => {
  const componentId = req.params.id;
  const { content_json, position_x, position_y, order_index } = req.body;

  try {
    const result = await pool.query(
      `UPDATE page_components 
       SET content_json=$1, position_x=$2, position_y=$3, order_index=$4 
       WHERE component_id=$5 
       RETURNING *`,
      [
        JSON.stringify(content_json),
        position_x,
        position_y,
        order_index,
        componentId,
      ]
    );

    if (!result.rows.length)
      return res.status(404).send("Component not found");

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error updating component");
  }
});

// DELETE COMPONENT
app.delete("/components/:id", async (req, res) => {
  const componentId = req.params.id;

  try {
    await pool.query("DELETE FROM page_components WHERE component_id=$1", [
      componentId,
    ]);
    res.send("Component deleted");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting component");
  }
});

// =====================================================
// SIMPLE CODE GENERATOR
// =====================================================

function renderHTML(component) {
  const c = component.content_json || {};

  if (component.type === "text") {
    return `<p>${c.text || ""}</p>`;
  } else if (component.type === "button") {
    return `<button>${c.text || "Click"}</button>`;
  } else if (component.type === "image") {
    return `<img src="${c.src}" width="${c.width || 200}"/>`;
  }
  return "";
}

app.get("/generate/:projectId", async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const pages = await pool.query(
      "SELECT * FROM project_pages WHERE project_id=$1",
      [projectId]
    );

    const output = {};

    for (const page of pages.rows) {
      const comps = await pool.query(
        "SELECT * FROM page_components WHERE page_id=$1 ORDER BY order_index ASC",
        [page.page_id]
      );

      const html = comps.rows.map(renderHTML).join("\n");

      output[page.page_name] = `
        <html>
        <head><title>${page.page_name}</title></head>
        <body>${html}</body>
        </html>
      `;
    }

    res.json(output);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error generating HTML");
  }
});

// =====================================================
app.listen(4000, () =>
  console.log("PageCrafter Backend running on port 4000...")
);
