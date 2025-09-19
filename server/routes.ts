import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertBlogSchema, updateBlogSchema } from "@shared/schema";
import { z } from "zod";

import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: any;
}

const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const user = await storage.getUser(userId as string);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  
  req.user = user;
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.json({ user: existingUser }); // Return existing user instead of error
      }

      // Create user with Firebase UID as the ID
      const userToCreate = userId ? { ...userData, id: userId } : userData;
      const user = await storage.createUser(userToCreate);
      res.json({ user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Blog routes
  app.get("/api/blogs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const blogs = await storage.getPublishedBlogs(limit, offset);
      res.json({ blogs });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/blogs/:id", async (req, res) => {
    try {
      const blog = await storage.getBlogWithAuthor(req.params.id);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      // Increment view count
      await storage.incrementBlogViews(req.params.id);
      
      res.json({ blog });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user/:userId/blogs", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.id !== req.params.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const blogs = await storage.getBlogsByAuthor(req.params.userId);
      res.json({ blogs });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/blogs", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const blogData = insertBlogSchema.parse({
        ...req.body,
        authorId: req.user.id,
      });

      const blog = await storage.createBlog(blogData);
      res.json({ blog });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/blogs/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const blog = await storage.getBlog(req.params.id);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      if (blog.authorId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updateData = updateBlogSchema.parse(req.body);
      const updatedBlog = await storage.updateBlog(req.params.id, updateData);
      
      res.json({ blog: updatedBlog });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/blogs/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const deleted = await storage.deleteBlog(req.params.id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ message: "Blog not found or access denied" });
      }
      
      res.json({ message: "Blog deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
