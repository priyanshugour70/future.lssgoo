'use client';

import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Rocket,
  Users,
  TrendingUp,
  Search,
  Star,
  ArrowRight,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 gap-1">
              <Sparkles className="h-3 w-3" />
              Discover Exceptional Startups
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Find{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                YC-Backed Startups
              </span>{' '}
              with Elite Teams
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Discover startups funded by Y Combinator and top accelerators. Small teams, big
              talent, exceptional passion. Find companies where every person makes a difference.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {!loading && (
                <>
                  {user ? (
                    <Button size="lg" asChild className="gap-2">
                      <Link href="/companies">
                        Browse Companies
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button size="lg" asChild className="gap-2">
                        <Link href="/signup">
                          Get Started
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" asChild>
                        <Link href="/signin">Sign In</Link>
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Future?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We curate startups that embody excellence, passion, and innovation
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>YC & Top Accelerators</CardTitle>
                <CardDescription>
                  Exclusively featuring startups backed by Y Combinator and leading accelerators
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Small, Elite Teams</CardTitle>
                <CardDescription>
                  Focus on companies with lean teams of highly talented, passionate individuals
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Growth Potential</CardTitle>
                <CardDescription>
                  Discover companies poised for exponential growth with proven funding
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Detailed Insights</CardTitle>
                <CardDescription>
                  Access comprehensive data on founders, team size, funding, and industry focus
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Industry Categories</CardTitle>
                <CardDescription>
                  Filter by sector, technology stack, and business model to find your niche
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-Time Updates</CardTitle>
                <CardDescription>
                  Stay informed with the latest funding rounds, team changes, and milestones
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border/40 bg-muted/30 py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">500+</div>
              <div className="mt-2 text-sm text-muted-foreground">Curated Companies</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">1,000+</div>
              <div className="mt-2 text-sm text-muted-foreground">Talented Founders</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">$2B+</div>
              <div className="mt-2 text-sm text-muted-foreground">Total Funding</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center sm:p-16">
              <Star className="h-12 w-12 text-primary" />
              <h2 className="text-3xl font-bold tracking-tight">
                Ready to Discover Your Next Opportunity?
              </h2>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Join our community and get exclusive access to the most promising startups with
                passionate, talented teams building the future.
              </p>
              {!loading && !user && (
                <Button size="lg" className="mt-4 gap-2" asChild>
                  <Link href="/signup">
                    Start Exploring
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
