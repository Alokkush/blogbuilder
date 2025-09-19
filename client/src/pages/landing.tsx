import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">
                <i className="fas fa-blog mr-2"></i>BlogBuilder
              </h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/blogs" className="text-muted-foreground hover:text-foreground transition-colors">
                Explore
              </Link>
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

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 py-20 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-6">
                Build Beautiful Blogs
                <span className="text-primary block">In Minutes</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Create, customize, and publish stunning blogs with our powerful rich-text editor. 
                Choose from beautiful themes and reach your audience instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/signup">
                  <Button size="lg" data-testid="button-start-writing">
                    Start Writing Free
                  </Button>
                </Link>
                <Link href="/blogs">
                  <Button variant="outline" size="lg" data-testid="button-view-examples">
                    View Examples
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Everything You Need</h2>
              <p className="text-xl text-muted-foreground">Powerful features to create amazing blogs</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-edit text-2xl text-primary"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Rich Text Editor</h3>
                <p className="text-muted-foreground">Professional editor with formatting, media uploads, and auto-save</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-palette text-2xl text-primary"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Beautiful Themes</h3>
                <p className="text-muted-foreground">Choose from stunning templates or customize your own design</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-cloud text-2xl text-primary"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Cloud Storage</h3>
                <p className="text-muted-foreground">Secure Supabase storage for all your content and media</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
              Ready to start your blogging journey?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Join thousands of writers who trust BlogBuilder to publish their stories.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" data-testid="button-get-started-today">
                Get Started Today
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
