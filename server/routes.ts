import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertProjectSchema, insertBlogPostSchema } from "@shared/schema";
import { setupAuth } from "./auth";

const TELEGRAM_BOT_TOKEN = "7268134595:AAFQ7sM_6L_Hujlo1doc6LVuGYZRbD_sOuE";
const TELEGRAM_CHAT_ID = ""; // Cần bổ sung chat ID

async function sendTelegramMessage(message: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    })
  });
}

function isAuthenticated(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Categories routes
  app.get("/api/categories", async (_req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // Projects routes
  app.get("/api/projects", async (req, res) => {
    const categoryId = req.query.category ? Number(req.query.category) : undefined;
    const projects = categoryId 
      ? await storage.getProjectsByCategory(categoryId)
      : await storage.getProjects();
    res.json(projects);
  });

  app.get("/api/projects/:id", async (req, res) => {
    const project = await storage.getProject(Number(req.params.id));
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.json(project);
  });

  app.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const project = insertProjectSchema.parse(req.body);
      const savedProject = await storage.createProject(project);
      res.json(savedProject);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  // Blog routes
  app.get("/api/blog", async (req, res) => {
    const categoryId = req.query.category ? Number(req.query.category) : undefined;
    const posts = categoryId
      ? await storage.getBlogPostsByCategory(categoryId)
      : await storage.getBlogPosts();
    res.json(posts);
  });

  app.get("/api/blog/:id", async (req, res) => {
    const post = await storage.getBlogPost(Number(req.params.id));
    if (!post) {
      res.status(404).json({ message: "Blog post not found" });
      return;
    }
    res.json(post);
  });

  app.post("/api/blog", isAuthenticated, async (req, res) => {
    try {
      const post = insertBlogPostSchema.parse(req.body);
      const savedPost = await storage.createBlogPost(post);
      res.json(savedPost);
    } catch (error) {
      res.status(400).json({ message: "Invalid blog post data" });
    }
  });

  // Contact form with Telegram integration
  app.post("/api/contact", async (req, res) => {
    try {
      const message = insertMessageSchema.parse(req.body);
      const savedMessage = await storage.createMessage(message);

      // Send to Telegram
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

  const httpServer = createServer(app);
  return httpServer;
}