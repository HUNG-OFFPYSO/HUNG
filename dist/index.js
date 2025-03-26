// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  categories;
  projects;
  blogPosts;
  messages;
  currentIds;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.categories = /* @__PURE__ */ new Map();
    this.projects = /* @__PURE__ */ new Map();
    this.blogPosts = /* @__PURE__ */ new Map();
    this.messages = /* @__PURE__ */ new Map();
    this.currentIds = {
      users: 1,
      categories: 1,
      projects: 1,
      blogPosts: 1,
      messages: 1
    };
    this.createUser({
      username: "admin",
      password: "admin123",
      // Should be hashed in production
      isAdmin: "true"
    });
    const categories2 = [
      { name: "Python", type: "project" },
      { name: "Web", type: "project" },
      { name: "C++", type: "project" },
      { name: "Tutorial", type: "blog" },
      { name: "Security", type: "blog" }
    ];
    categories2.forEach((cat) => this.createCategory(cat));
  }
  // Users
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }
  async createUser(user) {
    const id = this.currentIds.users++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
  // Categories
  async getCategories() {
    return Array.from(this.categories.values());
  }
  async getCategory(id) {
    return this.categories.get(id);
  }
  async createCategory(category) {
    const id = this.currentIds.categories++;
    const newCategory = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  // Projects
  async getProjects() {
    return Array.from(this.projects.values());
  }
  async getProjectsByCategory(categoryId) {
    return Array.from(this.projects.values()).filter((p) => p.categoryId === categoryId);
  }
  async getProject(id) {
    return this.projects.get(id);
  }
  async createProject(project) {
    const id = this.currentIds.projects++;
    const newProject = { ...project, id };
    this.projects.set(id, newProject);
    return newProject;
  }
  // Blog posts
  async getBlogPosts() {
    return Array.from(this.blogPosts.values());
  }
  async getBlogPostsByCategory(categoryId) {
    return Array.from(this.blogPosts.values()).filter((p) => p.categoryId === categoryId);
  }
  async getBlogPost(id) {
    return this.blogPosts.get(id);
  }
  async createBlogPost(post) {
    const id = this.currentIds.blogPosts++;
    const newPost = { ...post, id };
    this.blogPosts.set(id, newPost);
    return newPost;
  }
  // Messages
  async createMessage(message) {
    const id = this.currentIds.messages++;
    const newMessage = {
      ...message,
      id,
      created: /* @__PURE__ */ new Date()
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: text("is_admin").notNull().default("false")
});
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull()
  // 'project' or 'blog'
});
var projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  tags: text("tags").array().notNull(),
  link: text("link"),
  github: text("github"),
  categoryId: serial("category_id").references(() => categories.id),
  content: text("content").notNull()
});
var blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  publishDate: date("publish_date").notNull(),
  tags: text("tags").array().notNull(),
  categoryId: serial("category_id").references(() => categories.id)
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  created: date("created").notNull()
});
var insertUserSchema = createInsertSchema(users).omit({ id: true });
var insertCategorySchema = createInsertSchema(categories).omit({ id: true });
var insertProjectSchema = createInsertSchema(projects).omit({ id: true });
var insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true });
var insertMessageSchema = createInsertSchema(messages).omit({ id: true, created: true });

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
function setupAuth(app2) {
  app2.use(
    session({
      secret: "your-secret-key",
      // Nên thay thế bằng biến môi trường
      resave: false,
      saveUninitialized: false
    })
  );
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || user.password !== password) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });
  app2.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    res.json(req.user);
  });
}

// server/routes.ts
var TELEGRAM_BOT_TOKEN = "7268134595:AAFQ7sM_6L_Hujlo1doc6LVuGYZRbD_sOuE";
var TELEGRAM_CHAT_ID = "";
async function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML"
    })
  });
}
function isAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/categories", async (_req, res) => {
    const categories2 = await storage.getCategories();
    res.json(categories2);
  });
  app2.get("/api/projects", async (req, res) => {
    const categoryId = req.query.category ? Number(req.query.category) : void 0;
    const projects2 = categoryId ? await storage.getProjectsByCategory(categoryId) : await storage.getProjects();
    res.json(projects2);
  });
  app2.get("/api/projects/:id", async (req, res) => {
    const project = await storage.getProject(Number(req.params.id));
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.json(project);
  });
  app2.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const project = insertProjectSchema.parse(req.body);
      const savedProject = await storage.createProject(project);
      res.json(savedProject);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });
  app2.get("/api/blog", async (req, res) => {
    const categoryId = req.query.category ? Number(req.query.category) : void 0;
    const posts = categoryId ? await storage.getBlogPostsByCategory(categoryId) : await storage.getBlogPosts();
    res.json(posts);
  });
  app2.get("/api/blog/:id", async (req, res) => {
    const post = await storage.getBlogPost(Number(req.params.id));
    if (!post) {
      res.status(404).json({ message: "Blog post not found" });
      return;
    }
    res.json(post);
  });
  app2.post("/api/blog", isAuthenticated, async (req, res) => {
    try {
      const post = insertBlogPostSchema.parse(req.body);
      const savedPost = await storage.createBlogPost(post);
      res.json(savedPost);
    } catch (error) {
      res.status(400).json({ message: "Invalid blog post data" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const message = insertMessageSchema.parse(req.body);
      const savedMessage = await storage.createMessage(message);
      const telegramMessage = `
<b>New Contact Message</b>
From: ${message.name}
Email: ${message.email}
Message: ${message.message}
      `;
      await sendTelegramMessage(telegramMessage);
      res.json(savedMessage);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
