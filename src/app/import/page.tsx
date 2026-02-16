'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/import/FileUpload";

export default function ImportPage() {
  const router = useRouter();

  const handleUploadComplete = () => {
    // Redirect to dashboard after successful upload
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#6b6daa' }}>
            <Link href="/">Ralph</Link>
          </h1>
          <nav className="flex gap-4">
            <Link href="/">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-6 py-8">
        <h2 className="mb-6 text-xl font-semibold">Import Apple Health Data</h2>

        <FileUpload onUploadComplete={handleUploadComplete} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Export Apple Health Data</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ol className="list-inside list-decimal space-y-2">
              <li>Open the <strong>Health</strong> app on your iPhone</li>
              <li>Tap your profile picture in the top right</li>
              <li>Scroll down and tap <strong>Export All Health Data</strong></li>
              <li>Wait for the export to complete (may take a few minutes)</li>
              <li>Save the ZIP file and upload it here</li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
