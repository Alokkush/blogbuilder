import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getPublishedBlogs } from '@/lib/firebase';
import { BlogWithAuthor } from '@shared/schema';

const BlogsPage = () => {
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<BlogWithAuthor[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    loadBlogs();
  }, []);

  useEffect(() => {
    filterAndSortBlogs();
  }, [blogs, searchTerm, categoryFilter, sortBy]);

  const loadBlogs = async () => {
    try {
      const publishedBlogs = await getPublishedBlogs(50);
      setBlogs(publishedBlogs as BlogWithAuthor[]);
    } catch (error) {
      console.error('Error loading blogs:', error);
      toast({
        title: "Error",
        description: "Failed to load blogs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortBlogs = () => {
    let filtered = [...blogs];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(blog => blog.category === categoryFilter);
    }

    // Sort blogs
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => parseInt(b.views || '0') - parseInt(a.views || '0'));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
    }

    setFilteredBlogs(filtered);
  };

  const categories = Array.from(new Set(blogs.map(blog => blog.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <h1 className="text-xl font-bold text-primary cursor-pointer">
                <i className="fas fa-blog mr-2"></i>BlogBuilder
              </h1>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-foreground font-medium">Explore</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="hidden md:block">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button data-testid="button-get-started">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Discover Amazing Blogs</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Explore thousands of blogs written by talented creators from around the world
            </p>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
              <div className="relative flex-1 w-full">
                <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                <Input
                  placeholder="Search blogs, topics, authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12"
                  data-testid="input-search"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category || ''}>
                      {category ? category.charAt(0).toUpperCase() + category.slice(1) : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-32" data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Blogs Content */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-search text-4xl text-muted-foreground mb-4"></i>
              <h2 className="text-2xl font-bold text-foreground mb-2">No blogs found</h2>
              <p className="text-muted-foreground mb-6">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No blogs have been published yet.'
                }
              </p>
              {!searchTerm && categoryFilter === 'all' && (
                <Link href="/signup">
                  <Button data-testid="button-start-writing">
                    Start Writing
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Featured Blogs */}
              {searchTerm === '' && categoryFilter === 'all' && sortBy === 'latest' && filteredBlogs.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-foreground mb-8">Featured Blogs</h2>
                  <div className="grid lg:grid-cols-2 gap-8">
                    {filteredBlogs.slice(0, 2).map((blog) => (
                      <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                              {blog.category || 'Uncategorized'}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {Math.max(1, Math.ceil(blog.content.length / 1000))} min read
                            </span>
                          </div>
                          <Link href={`/blog/${blog.id}`}>
                            <h3 className="text-xl font-bold text-foreground mb-2 hover:text-primary transition-colors cursor-pointer" data-testid={`blog-title-${blog.id}`}>
                              {blog.title}
                            </h3>
                          </Link>
                          <p className="text-muted-foreground mb-4" data-testid={`blog-excerpt-${blog.id}`}>
                            {blog.excerpt || blog.content.substring(0, 200) + '...'}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <i className="fas fa-user text-primary text-sm"></i>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground" data-testid={`blog-author-${blog.id}`}>
                                  {blog.author?.name || 'Anonymous'}
                                </p>
                                <p className="text-xs text-muted-foreground" data-testid={`blog-date-${blog.id}`}>
                                  {new Date(blog.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span data-testid={`blog-views-${blog.id}`}>
                                <i className="fas fa-eye mr-1"></i>
                                {parseInt(blog.views || '0').toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* All Blogs Grid */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    {searchTerm === '' && categoryFilter === 'all' && sortBy === 'latest' 
                      ? 'Recent Blogs' 
                      : 'Blogs'
                    }
                  </h2>
                  <p className="text-muted-foreground">
                    {filteredBlogs.length} blog{filteredBlogs.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredBlogs.slice(searchTerm === '' && categoryFilter === 'all' && sortBy === 'latest' ? 2 : 0).map((blog) => (
                    <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                            {blog.category || 'Uncategorized'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {Math.max(1, Math.ceil(blog.content.length / 1000))} min read
                          </span>
                        </div>
                        <Link href={`/blog/${blog.id}`}>
                          <h3 className="font-semibold text-foreground mb-2 hover:text-primary transition-colors cursor-pointer" data-testid={`blog-title-${blog.id}`}>
                            {blog.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-4" data-testid={`blog-excerpt-${blog.id}`}>
                          {blog.excerpt || blog.content.substring(0, 150) + '...'}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <i className="fas fa-user text-primary text-xs"></i>
                            </div>
                            <span className="text-xs text-muted-foreground" data-testid={`blog-author-${blog.id}`}>
                              {blog.author?.name || 'Anonymous'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                            <span data-testid={`blog-views-${blog.id}`}>
                              <i className="fas fa-eye mr-1"></i>
                              {parseInt(blog.views || '0').toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Ready to share your story?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join our community of writers and start creating amazing blog posts today.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" data-testid="button-join-community">
              Join the Community
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">
                <i className="fas fa-blog mr-2"></i>BlogBuilder
              </h3>
              <p className="text-muted-foreground text-sm">
                Create, customize, and publish beautiful blogs with our powerful platform.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Themes</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Enterprise</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">© 2024 BlogBuilder. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <i className="fab fa-github"></i>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogsPage;
