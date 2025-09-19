import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ThemeSelector } from '@/components/theme-selector';
import { MediaUpload } from '@/components/media-upload';
import { useAuth } from '@/contexts/auth-context';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useToast } from '@/hooks/use-toast';
import { createBlog, updateBlog, getBlog } from '@/lib/firebase';
import { Blog } from '@shared/schema';

const EditorPage = () => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();

  const [blogData, setBlogData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'technology',
    tags: '',
    theme: 'modern',
    isPublished: false,
  });
  
  const [blogId, setBlogId] = useState<string | null>(null);
  const [loadingBlog, setLoadingBlog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto-save functionality
  useAutoSave({
    blogId,
    content: blogData.content,
    title: blogData.title,
    enabled: !!blogId && !!user,
  });

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  useEffect(() => {
    const urlParams = new URLSearchParams(search);
    const id = urlParams.get('id');
    if (id && user) {
      setBlogId(id);
      loadBlog(id);
    }
  }, [search, user]);

  const loadBlog = async (id: string) => {
    setLoadingBlog(true);
    try {
      const blog = await getBlog(id) as any;
      if (blog && blog.authorId === user?.uid) {
        setBlogData({
          title: blog.title || '',
          content: blog.content || '',
          excerpt: blog.excerpt || '',
          category: blog.category || 'technology',
          tags: blog.tags?.join(', ') || '',
          theme: blog.theme || 'modern',
          isPublished: blog.isPublished || false,
        });
      } else {
        toast({
          title: "Blog not found",
          description: "The blog you're trying to edit doesn't exist or you don't have permission.",
          variant: "destructive",
        });
        setLocation('/dashboard');
      }
    } catch (error) {
      console.error('Error loading blog:', error);
      toast({
        title: "Error",
        description: "Failed to load blog. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingBlog(false);
    }
  };

  const handleSave = async (publish = false) => {
    if (!user) return;
    
    setSaving(true);

    try {
      const blogPayload = {
        title: blogData.title || 'Untitled',
        content: blogData.content,
        excerpt: blogData.excerpt || blogData.content.substring(0, 150),
        category: blogData.category,
        tags: blogData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        theme: blogData.theme,
        isPublished: publish,
        authorId: user.uid,
      };

      if (blogId) {
        // Update existing blog
        await updateBlog(blogId, {
          ...blogPayload,
          isPublished: publish,
        });
        toast({
          title: publish ? "Blog published!" : "Draft saved!",
          description: publish ? "Your blog is now live." : "Your changes have been saved.",
        });
      } else {
        // Create new blog
        const newBlogId = await createBlog(blogPayload);
        setBlogId(newBlogId);
        setLocation(`/editor?id=${newBlogId}`);
        toast({
          title: publish ? "Blog published!" : "Draft saved!",
          description: publish ? "Your blog is now live." : "Your blog has been saved as a draft.",
        });
      }

      if (publish) {
        setLocation('/dashboard');
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      toast({
        title: "Save failed",
        description: "Failed to save your blog. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMediaUpload = (urls: string[]) => {
    // Insert images into the content
    const imageHtml = urls.map(url => `<img src="${url}" alt="Uploaded media" style="max-width: 100%; height: auto;" />`).join('\n');
    setBlogData(prev => ({
      ...prev,
      content: prev.content + '\n' + imageHtml
    }));

    toast({
      title: "Media uploaded",
      description: `${urls.length} file(s) have been added to your blog.`,
    });
  };

  if (loading || loadingBlog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Editor Navigation */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <i className="fas fa-arrow-left mr-2"></i>Back
                </Button>
              </Link>
              <h1 className="text-lg font-semibold text-foreground">
                {blogId ? 'Edit Blog' : 'New Blog'}
              </h1>
              <div className="text-sm text-muted-foreground">
                <i className="fas fa-save mr-1"></i>
                Auto-save enabled
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={saving}
                data-testid="button-save-draft"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={saving || !blogData.title.trim()}
                data-testid="button-publish"
              >
                {saving ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Editor Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Blog Settings */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Blog Settings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Blog Title *</Label>
                <Input
                  id="title"
                  value={blogData.title}
                  onChange={(e) => setBlogData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your blog title"
                  data-testid="input-title"
                />
              </div>
              
              <ThemeSelector
                value={blogData.theme}
                onChange={(theme) => setBlogData(prev => ({ ...prev, theme }))}
              />
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={blogData.category}
                  onValueChange={(category) => setBlogData(prev => ({ ...prev, category }))}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={blogData.tags}
                  onChange={(e) => setBlogData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="web, css, design (comma separated)"
                  data-testid="input-tags"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="excerpt">Excerpt (Optional)</Label>
                <textarea
                  id="excerpt"
                  value={blogData.excerpt}
                  onChange={(e) => setBlogData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of your blog post..."
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={3}
                  data-testid="textarea-excerpt"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Rich Text Editor */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <RichTextEditor
              value={blogData.content}
              onChange={(content) => setBlogData(prev => ({ ...prev, content }))}
              placeholder="Start writing your blog post..."
            />
          </CardContent>
        </Card>
        
        {/* Media Upload */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Media Library</h3>
            <MediaUpload onUpload={handleMediaUpload} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditorPage;
