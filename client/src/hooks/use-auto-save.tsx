import { useEffect, useRef, useCallback } from 'react';
import { updateBlog } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface UseAutoSaveOptions {
  blogId: string | null;
  content: string;
  title: string;
  delay?: number;
  enabled?: boolean;
}

export const useAutoSave = ({ 
  blogId, 
  content, 
  title, 
  delay = 2000, 
  enabled = true 
}: UseAutoSaveOptions) => {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef({ content: '', title: '' });
  
  const saveContent = useCallback(async () => {
    if (!blogId || !enabled) return;
    
    const hasChanges = 
      lastSavedRef.current.content !== content ||
      lastSavedRef.current.title !== title;
    
    if (!hasChanges) return;
    
    try {
      await updateBlog(blogId, {
        content,
        title,
        excerpt: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
      });
      
      lastSavedRef.current = { content, title };
      
      toast({
        title: "Auto-saved",
        description: "Your changes have been saved automatically.",
        duration: 2000,
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast({
        title: "Auto-save failed",
        description: "Failed to save your changes automatically.",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [blogId, content, title, enabled, toast]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (enabled && blogId) {
      timeoutRef.current = setTimeout(saveContent, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, title, saveContent, delay, enabled, blogId]);

  return { saveContent };
};
