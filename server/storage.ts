import { type User, type InsertUser, type Blog, type InsertBlog, type UpdateBlog, type BlogWithAuthor } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Blog methods
  getBlog(id: string): Promise<Blog | undefined>;
  getBlogWithAuthor(id: string): Promise<BlogWithAuthor | undefined>;
  getBlogsByAuthor(authorId: string): Promise<Blog[]>;
  getPublishedBlogs(limit?: number, offset?: number): Promise<BlogWithAuthor[]>;
  createBlog(blog: InsertBlog): Promise<Blog>;
  updateBlog(id: string, updates: UpdateBlog): Promise<Blog | undefined>;
  deleteBlog(id: string, authorId: string): Promise<boolean>;
  incrementBlogViews(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private blogs: Map<string, Blog>;

  constructor() {
    this.users = new Map();
    this.blogs = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getBlog(id: string): Promise<Blog | undefined> {
    return this.blogs.get(id);
  }

  async getBlogWithAuthor(id: string): Promise<BlogWithAuthor | undefined> {
    const blog = this.blogs.get(id);
    if (!blog) return undefined;

    const author = this.users.get(blog.authorId);
    if (!author) return undefined;

    return { ...blog, author };
  }

  async getBlogsByAuthor(authorId: string): Promise<Blog[]> {
    return Array.from(this.blogs.values())
      .filter((blog) => blog.authorId === authorId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getPublishedBlogs(limit = 20, offset = 0): Promise<BlogWithAuthor[]> {
    const publishedBlogs = Array.from(this.blogs.values())
      .filter((blog) => blog.isPublished)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);

    const blogsWithAuthors: BlogWithAuthor[] = [];
    for (const blog of publishedBlogs) {
      const author = this.users.get(blog.authorId);
      if (author) {
        blogsWithAuthors.push({ ...blog, author });
      }
    }

    return blogsWithAuthors;
  }

  async createBlog(insertBlog: InsertBlog): Promise<Blog> {
    const id = randomUUID();
    const now = new Date();
    const blog: Blog = { 
      ...insertBlog,
      excerpt: insertBlog.excerpt || null,
      category: insertBlog.category || null,
      tags: insertBlog.tags || null,
      theme: insertBlog.theme || null,
      isPublished: insertBlog.isPublished || null,
      id,
      createdAt: now,
      updatedAt: now,
      views: "0",
      mediaUrls: insertBlog.mediaUrls || [],
    };
    this.blogs.set(id, blog);
    return blog;
  }

  async updateBlog(id: string, updates: UpdateBlog): Promise<Blog | undefined> {
    const blog = this.blogs.get(id);
    if (!blog) return undefined;

    const updatedBlog: Blog = {
      ...blog,
      ...updates,
      updatedAt: new Date(),
    };
    this.blogs.set(id, updatedBlog);
    return updatedBlog;
  }

  async deleteBlog(id: string, authorId: string): Promise<boolean> {
    const blog = this.blogs.get(id);
    if (!blog || blog.authorId !== authorId) return false;

    return this.blogs.delete(id);
  }

  async incrementBlogViews(id: string): Promise<void> {
    const blog = this.blogs.get(id);
    if (blog) {
      const currentViews = parseInt(blog.views || "0") || 0;
      blog.views = (currentViews + 1).toString();
      this.blogs.set(id, blog);
    }
  }
}

export const storage = new MemStorage();
