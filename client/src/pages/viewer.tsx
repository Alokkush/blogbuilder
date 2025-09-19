import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getBlog, incrementBlogViews } from '@/lib/supabase';
import { BlogWithAuthor } from '@shared/schema';

const ViewerPage = () => {
  const params = useParams();
  const { toast } = useToast();
  const [blog, setBlog] = useState<BlogWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadBlog(params.id);
    }
  }, [params.id]);

  const loadBlog = async (id: string) => {
    try {
      const blogData = await getBlog(id) as any;
      if (blogData && blogData.isPublished) {
        setBlog(blogData as BlogWithAuthor);
        // Increment view count
        await incrementBlogViews(id);
      } else {
        toast({
          title: "Blog not found",
          description: "The blog you're looking for doesn't exist or is not published.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading blog:', error);
      toast({
        title: "Error",
        description: "Failed to load the blog. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    toast({
      title: liked ? "Like removed" : "Liked!",
      description: liked ? "You unliked this post." : "Thanks for liking this post!",
    });
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = blog?.title || 'Check out this blog post';
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "The blog link has been copied to your clipboard.",
        });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <i className="fas fa-file-alt text-4xl text-muted-foreground mb-4"></i>
            <h1 className="text-xl font-bold text-foreground mb-2">Blog Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The blog post you're looking for doesn't exist or is not published.
            </p>
            <Link href="/blogs">
              <Button>Browse All Blogs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/blogs">
              <Button variant="ghost" data-testid="button-back-to-blogs">
                <i className="fas fa-arrow-left mr-2"></i>Back to Blogs
              </Button>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare('copy')}
                title="Copy Link"
                data-testid="button-share"
              >
                <i className="fas fa-share-alt"></i>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                title={liked ? "Unlike" : "Like"}
                className={liked ? "text-red-500" : ""}
                data-testid="button-like"
              >
                <i className={liked ? "fas fa-heart" : "far fa-heart"}></i>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Blog Content */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Blog Header */}
        <header className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
              {blog.category || 'Uncategorized'}
            </span>
            <span>•</span>
            <span data-testid="blog-read-time">
              {Math.max(1, Math.ceil(blog.content.length / 1000))} min read
            </span>
            <span>•</span>
            <span data-testid="blog-publish-date">
              {new Date(blog.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="blog-title">
            {blog.title}
          </h1>
          
          {blog.excerpt && (
            <p className="text-xl text-muted-foreground mb-6" data-testid="blog-excerpt">
              {blog.excerpt}
            </p>
          )}

          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-muted px-2 py-1 rounded text-sm text-muted-foreground"
                  data-testid={`blog-tag-${index}`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <i className="fas fa-user text-primary"></i>
            </div>
            <div>
              <p className="font-medium text-foreground" data-testid="blog-author">
                {blog.author?.name || 'Anonymous'}
              </p>
              <p className="text-sm text-muted-foreground">
                {parseInt(blog.views || '0').toLocaleString()} views
              </p>
            </div>
          </div>
        </header>
        
        {/* Blog Content */}
        <div 
          className="prose prose-lg max-w-none"
          data-testid="blog-content"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
        
        {/* Blog Actions */}
        <div className="flex items-center justify-between py-8 border-t border-border mt-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleLike}
              className={`flex items-center space-x-2 ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="button-like-action"
            >
              <i className={liked ? "fas fa-heart" : "far fa-heart"}></i>
              <span>{liked ? 'Liked' : 'Like'}</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare('twitter')}
              title="Share on Twitter"
              data-testid="button-share-twitter"
            >
              <i className="fab fa-twitter"></i>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare('linkedin')}
              title="Share on LinkedIn"
              data-testid="button-share-linkedin"
            >
              <i className="fab fa-linkedin"></i>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare('copy')}
              title="Copy Link"
              data-testid="button-copy-link"
            >
              <i className="fas fa-link"></i>
            </Button>
          </div>
        </div>

        {/* Author Section */}
        {blog.author && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <i className="fas fa-user text-2xl text-primary"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground" data-testid="author-name">
                    {blog.author.name}
                  </h3>
                  <p className="text-muted-foreground" data-testid="author-email">
                    {blog.author.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </article>
    </div>
  );
};

export default ViewerPage;
