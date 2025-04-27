// src/components/hero/HeroButtons.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Rocket, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function HeroButtons() {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4">
      <Button asChild className="bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)] transition-colors">
        <Link href="/dashboard" className="flex items-center">
          Get Started
          <Rocket className="ml-2 h-4 w-4" />
        </Link>
      </Button>
      <Button 
        variant="outline" 
        className="border-[var(--cosmic-accent)] text-[var(--text-primary)] hover:bg-[var(--cosmic-light)] transition-colors"
        onClick={scrollToFeatures}
      >
        Learn More
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}