'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FileUpload } from "@/components/import/FileUpload";

export default function ImportPage() {
  const router = useRouter();

  const handleUploadComplete = () => {
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold tracking-tight">
            <Link href="/">Ralph</Link>
          </h1>
          <nav className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-6 py-8">
        <h2 className="mb-6 text-base font-semibold uppercase tracking-wide text-muted-foreground">
          Import Apple Health Data
        </h2>

        <FileUpload onUploadComplete={handleUploadComplete} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Export</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ol className="list-inside list-decimal space-y-2">
              <li>Open the <strong className="text-foreground">Health</strong> app on your iPhone</li>
              <li>Tap your profile picture in the top right</li>
              <li>Scroll down and tap <strong className="text-foreground">Export All Health Data</strong></li>
              <li>Wait for the export to complete</li>
              <li>Save the ZIP file and upload it here</li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
