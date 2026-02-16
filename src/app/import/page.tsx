'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <header>
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-4 py-5 sm:px-6 lg:px-12">
          <h1 className="text-2xl font-bold tracking-tight">
            <Link href="/">Ralph</Link>
          </h1>
          <nav className="flex gap-3">
            <Link href="/">
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-12">
        <h2 className="mb-6 text-[1.25rem] font-semibold tracking-tight">
          Import Apple Health Data
        </h2>

        <FileUpload onUploadComplete={handleUploadComplete} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-[1.25rem] font-semibold tracking-tight">
              How to Export Apple Health Data
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            <ol className="list-inside list-decimal space-y-2.5">
              <li>Open the <strong className="text-foreground">Health</strong> app on your iPhone</li>
              <li>Tap your profile picture in the top right</li>
              <li>Scroll down and tap <strong className="text-foreground">Export All Health Data</strong></li>
              <li>Wait for the export to complete (may take a few minutes)</li>
              <li>Save the ZIP file and upload it here</li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
