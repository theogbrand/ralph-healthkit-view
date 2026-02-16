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
    <div className="min-h-screen relative z-10">
      <header className="bg-white/[0.08] backdrop-blur-[20px] border-b border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-white">
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
        <h2 className="mb-6 text-xl font-bold text-white">Import Apple Health Data</h2>

        <FileUpload onUploadComplete={handleUploadComplete} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Export Apple Health Data</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-white/60">
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
