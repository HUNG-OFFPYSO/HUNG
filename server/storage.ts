import { 
  type Project, type InsertProject,
  type BlogPost, type InsertBlogPost,
  type Message, type InsertMessage,
  type Category, type InsertCategory,
  type User, type InsertUser
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Projects
  getProjects(): Promise<Project[]>;
  getProjectsByCategory(categoryId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;

  // Blog posts
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPostsByCategory(categoryId: number): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;

  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private projects: Map<number, Project>;
  private blogPosts: Map<number, BlogPost>;
  private messages: Map<number, Message>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.projects = new Map();
    this.blogPosts = new Map();
    this.messages = new Map();
    this.currentIds = { 
      users: 1, 
      categories: 1, 
      projects: 1, 
      blogPosts: 1, 
      messages: 1 
    };

    // Create default admin user
    this.createUser({
      username: "admin",
      password: "admin123", // Should be hashed in production
      isAdmin: "true"
    });

    // Create default categories
    const categories = [
      { name: "Python", type: "project" },
      { name: "Web", type: "project" },
      { name: "C++", type: "project" },
      { name: "Tutorial", type: "blog" },
      { name: "Security", type: "blog" }
    ];

    categories.forEach(cat => this.createCategory(cat));
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentIds.categories++;
    const newCategory = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProjectsByCategory(categoryId: number): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(p => p.categoryId === categoryId);
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.currentIds.projects++;
    const newProject = { ...project, id };
    this.projects.set(id, newProject);
    return newProject;
  }

  // Blog posts
  async getBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values());
  }

  async getBlogPostsByCategory(categoryId: number): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values())
      .filter(p => p.categoryId === categoryId);
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const id = this.currentIds.blogPosts++;
    const newPost = { ...post, id };
    this.blogPosts.set(id, newPost);
    return newPost;
  }

  // Messages
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentIds.messages++;
    const newMessage = { 
      ...message, 
      id,
      created: new Date()
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }
}

export const storage = new MemStorage();