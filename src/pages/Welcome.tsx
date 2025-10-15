import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/navigation/Navbar';

const Welcome = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Visual Overview',
      description: 'Switch between kanban and table views to manage orders your way'
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: 'Monitor order status and due dates at a glance'
    },
    {
      icon: Shield,
      title: 'Organized & Secure',
      description: 'Keep all purchase order details in one central location'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6">
        {/* Hero Section */}
        <section className="py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                Modern Order Management
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Streamline Your
              </span>
              <br />
              <span className="text-foreground">Purchase Orders</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A modern dashboard designed to help you manage, track, and organize 
              all your purchase orders with ease and efficiency.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                asChild
                className="group text-lg px-8 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"
              >
                <Link to="/dashboard">
                  View Dashboard
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 animate-scale-in">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="p-6 hover:shadow-md transition-all hover:scale-[1.02] bg-gradient-to-br from-card to-card/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 border border-primary/10">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 max-w-4xl mx-auto">
          <Card className="p-8 lg:p-12 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  100%
                </div>
                <div className="text-muted-foreground">Organized</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  2 Views
                </div>
                <div className="text-muted-foreground">Kanban & Table</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Real-time
                </div>
                <div className="text-muted-foreground">Updates</div>
              </div>
            </div>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Ready to get organized?
            </h2>
            <p className="text-lg text-muted-foreground">
              Start managing your purchase orders more efficiently today.
            </p>
            <Button 
              size="lg" 
              asChild
              className="group text-lg px-8"
            >
              <Link to="/dashboard">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-20">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>Built with modern tools for modern workflows</p>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
