import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">Ralph</h1>
          <nav className="flex gap-4">
            <Link href="/import">
              <Button variant="outline">Import Data</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Fitness Score Section */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Overall Fitness Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                No data yet. Import your Apple Health data to get started.
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Metric Cards Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Cardio Fitness</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">VO2 Max, Resting HR, HRV</p>
              <div className="mt-4 text-center text-muted-foreground">--</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Activity Level</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Steps, Exercise, Energy</p>
              <div className="mt-4 text-center text-muted-foreground">--</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Body</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Weight, Body Fat, BMI</p>
              <div className="mt-4 text-center text-muted-foreground">--</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Recovery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Sleep, HRV, Readiness</p>
              <div className="mt-4 text-center text-muted-foreground">--</div>
            </CardContent>
          </Card>
        </section>

        {/* Trend Charts Placeholder */}
        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                Trend charts will appear here once data is imported.
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sync Status */}
        <section className="mt-8">
          <Card>
            <CardContent className="flex items-center justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Last Sync: Never
              </div>
              <Link href="/import">
                <Button size="sm">Import Data</Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
