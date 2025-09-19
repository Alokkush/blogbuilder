import { users, blogs, type User, type InsertUser, type Blog, type InsertBlog, type UpdateBlog, type BlogWithAuthor } from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, sql } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userData = insertUser.id ? insertUser : {
      ...insertUser,
      id: undefined, // Let database generate UUID if no ID provided
    };
    
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async getBlog(id: string): Promise<Blog | undefined> {
    const [blog] = await db.select().from(blogs).where(eq(blogs.id, id));
    return blog || undefined;
  }

  async getBlogWithAuthor(id: string): Promise<BlogWithAuthor | undefined> {
    const result = await db
      .select()
      .from(blogs)
      .leftJoin(users, eq(blogs.authorId, users.id))
      .where(eq(blogs.id, id));

    if (!result[0] || !result[0].users) return undefined;

    return {
      ...result[0].blogs,
      author: result[0].users,
    };
  }

  async getBlogsByAuthor(authorId: string): Promise<Blog[]> {
    return await db
      .select()
      .from(blogs)
      .where(eq(blogs.authorId, authorId))
      .orderBy(desc(blogs.updatedAt));
  }

  async getPublishedBlogs(limit = 20, offset = 0): Promise<BlogWithAuthor[]> {
    const result = await db
      .select()
      .from(blogs)
      .leftJoin(users, eq(blogs.authorId, users.id))
      .where(eq(blogs.isPublished, true))
      .orderBy(desc(blogs.createdAt))
      .limit(limit)
      .offset(offset);

    return result
      .filter((row) => row.users)
      .map((row) => ({
        ...row.blogs,
        author: row.users!,
      }));
  }

  async createBlog(insertBlog: InsertBlog): Promise<Blog> {
    const [blog] = await db
      .insert(blogs)
      .values({
        ...insertBlog,
        excerpt: insertBlog.excerpt || null,
        category: insertBlog.category || null,
        tags: insertBlog.tags || null,
        theme: insertBlog.theme || null,
        isPublished: insertBlog.isPublished || false,
      })
      .returning();
    return blog;
  }

  async updateBlog(id: string, updates: UpdateBlog): Promise<Blog | undefined> {
    const [blog] = await db
      .update(blogs)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(blogs.id, id))
      .returning();
    return blog || undefined;
  }

  async deleteBlog(id: string, authorId: string): Promise<boolean> {
    const result = await db
      .delete(blogs)
      .where(and(eq(blogs.id, id), eq(blogs.authorId, authorId)))
      .returning({ id: blogs.id });
    return result.length > 0;
  }

  async incrementBlogViews(id: string): Promise<void> {
    await db
      .update(blogs)
      .set({
        views: sql`CAST(COALESCE(${blogs.views}, '0') AS INTEGER) + 1`,
      })
      .where(eq(blogs.id, id));
  }
}

export const storage = new DatabaseStorage();
