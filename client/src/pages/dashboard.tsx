import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getUserBlogs, deleteBlog, logOut } from '@/lib/firebase';
import { Blog } from '@shared/schema';

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  useEffect(() => {
    if (user) {
      loadUserBlogs();
    }
  }, [user]);

  useEffect(() => {
    filterBlogs();
  }, [blogs, searchTerm, filterType]);

  const loadUserBlogs = async () => {
    try {
      const userBlogs = await getUserBlogs(user!.uid);
      setBlogs(userBlogs as Blog[]);
    } catch (error) {
      console.error('Error loading blogs:', error);
      toast({
        title: "Error",
        description: "Failed to load your blogs.",
        variant: "destructive",
      });
    } finally {
      setLoadingBlogs(false);
    }
  };

  const filterBlogs = () => {
    let filtered = blogs;

    // Filter by type
    if (filterType === 'published') {
      filtered = filtered.filter(blog => blog.isPublished);
    } else if (filterType === 'drafts') {
      filtered = filtered.filter(blog => !blog.isPublished);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.excerpt && blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredBlogs(filtered);
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      await deleteBlog(blogId);
      await loadUserBlogs();
      toast({
        title: "Blog deleted",
        description: "Your blog has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const stats = {
    total: blogs.length,
    published: blogs.filter(blog => blog.isPublished).length,
    drafts: blogs.filter(blog => !blog.isPublished).length,
    totalViews: blogs.reduce((sum, blog) => sum + parseInt(blog.views || '0'), 0),
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/">
                <h1 className="text-xl font-bold text-primary cursor-pointer">
                  <i className="fas fa-blog mr-2"></i>BlogBuilder
                </h1>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-foreground font-medium border-b-2 border-primary pb-4">
                  My Blogs
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground pb-4">
                  Analytics
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground pb-4">
                  Settings
                </a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/editor">
                <Button data-testid="button-new-blog">
                  <i className="fas fa-plus mr-2"></i>New Blog
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <i className="fas fa-user text-primary"></i>
                </div>
                <span className="text-sm font-medium hidden sm:block" data-testid="text-username">
                  {user.displayName || user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
                  <i className="fas fa-sign-out-alt"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Blogs</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-total-blogs">
                    {stats.total}
                  </p>
                </div>
                <i className="fas fa-file-alt text-2xl text-primary"></i>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-published">
                    {stats.published}
                  </p>
                </div>
                <i className="fas fa-eye text-2xl text-green-500"></i>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-drafts">
                    {stats.drafts}
                  </p>
                </div>
                <i className="fas fa-edit text-2xl text-amber-500"></i>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-views">
                    {stats.totalViews.toLocaleString()}
                  </p>
                </div>
                <i className="fas fa-chart-line text-2xl text-blue-500"></i>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Blog List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Your Blogs</CardTitle>
              <div className="flex items-center space-x-4">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40" data-testid="select-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Blogs</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="drafts">Drafts</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                  <Input
                    placeholder="Search blogs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                    data-testid="input-search"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingBlogs ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading your blogs...</p>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-file-alt text-4xl text-muted-foreground mb-4"></i>
                <p className="text-lg font-medium text-foreground mb-2">
                  {searchTerm || filterType !== 'all' ? 'No blogs found' : 'No blogs yet'}
                </p>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Start creating your first blog post!'
                  }
                </p>
                {!searchTerm && filterType === 'all' && (
                  <Link href="/editor">
                    <Button data-testid="button-create-first-blog">
                      <i className="fas fa-plus mr-2"></i>Create Your First Blog
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredBlogs.map((blog) => (
                  <div key={blog.id} className="p-6 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1" data-testid={`blog-title-${blog.id}`}>
                          {blog.title || 'Untitled'}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-2" data-testid={`blog-excerpt-${blog.id}`}>
                          {blog.excerpt || 'No description available.'}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className={blog.isPublished ? 'text-green-600' : 'text-amber-600'}>
                            {blog.isPublished ? 'Published' : 'Draft'}
                          </span>
                          <span data-testid={`blog-date-${blog.id}`}>
                            {new Date(blog.updatedAt).toLocaleDateString()}
                          </span>
                          <span data-testid={`blog-views-${blog.id}`}>
                            {parseInt(blog.views || '0').toLocaleString()} views
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Link href={`/editor?id=${blog.id}`}>
                          <Button variant="ghost" size="sm" title="Edit" data-testid={`button-edit-${blog.id}`}>
                            <i className="fas fa-edit"></i>
                          </Button>
                        </Link>
                        {blog.isPublished && (
                          <Link href={`/blog/${blog.id}`}>
                            <Button variant="ghost" size="sm" title="View" data-testid={`button-view-${blog.id}`}>
                              <i className="fas fa-eye"></i>
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Delete"
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-delete-${blog.id}`}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
