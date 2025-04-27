import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, Globe, Star, Users } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import { HeroButtons } from '@/components/hero/HeroButtons';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--cosmic-dark)] text-[var(--text-primary)]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center py-20">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Deploy Your Websites to the{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--cosmic-highlight)] to-purple-500">
              Cosmos
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            The easiest way to deploy, manage, and scale your web projects with 
            our cosmic-powered platform.
          </p>
          <HeroButtons />
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 scroll-mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose <span className="text-[var(--cosmic-highlight)]">CosmicDeploy</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-[var(--cosmic-accent)] bg-[var(--cosmic-blue)] hover:border-[var(--cosmic-highlight)] transition-colors group">
              <CardHeader>
                <div className="p-3 bg-[var(--cosmic-light)] rounded-lg w-fit group-hover:bg-[var(--cosmic-highlight)] transition-colors">
                  <Globe className="h-8 w-8 text-[var(--cosmic-highlight)] group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-[var(--text-primary)] mt-4">
                  Effortless Deployment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-secondary)]">
                  Deploy any website with just a few clicks. Connect your Git repository 
                  and we&apos;ll handle the rest.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[var(--cosmic-accent)] bg-[var(--cosmic-blue)] hover:border-[var(--cosmic-highlight)] transition-colors group">
              <CardHeader>
                <div className="p-3 bg-[var(--cosmic-light)] rounded-lg w-fit group-hover:bg-[var(--cosmic-highlight)] transition-colors">
                  <Users className="h-8 w-8 text-[var(--cosmic-highlight)] group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-[var(--text-primary)] mt-4">
                  Team Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-secondary)]">
                  Invite team members and manage permissions with our intuitive 
                  collaboration tools.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[var(--cosmic-accent)] bg-[var(--cosmic-blue)] hover:border-[var(--cosmic-highlight)] transition-colors group">
              <CardHeader>
                <div className="p-3 bg-[var(--cosmic-light)] rounded-lg w-fit group-hover:bg-[var(--cosmic-highlight)] transition-colors">
                  <Star className="h-8 w-8 text-[var(--cosmic-highlight)] group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-[var(--text-primary)] mt-4">
                  Performance Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-secondary)]">
                  Real-time analytics and performance metrics to keep your sites 
                  running at cosmic speed.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center">
          <div className="border border-[var(--cosmic-accent)] bg-[var(--cosmic-blue)] rounded-xl p-8 max-w-4xl mx-auto hover:border-[var(--cosmic-highlight)] transition-colors">
            <h2 className="text-3xl font-bold mb-4">Ready to Launch?</h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
              Join thousands of developers deploying their projects with CosmicDeploy.
            </p>
            <Button asChild className="bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)] transition-colors">
              <Link href="/dashboard" className="flex items-center">
                Start Your Journey
                <Rocket className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--cosmic-accent)] bg-[var(--cosmic-blue)] py-8">
        <div className="container mx-auto px-4 text-center text-[var(--text-secondary)]">
          <p>© {new Date().getFullYear()} CosmicDeploy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}