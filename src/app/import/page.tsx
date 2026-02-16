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
    <div className="min-h-screen bg-[var(--surface)]">
      {/* Frosted glass sticky header - matches dashboard */}
      <header className="sticky top-0 z-50 backdrop-blur-[20px] bg-white/72 dark:bg-black/72 shadow-[0_0.5px_0_rgba(0,0,0,0.12)]">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <h1 className="text-[34px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">
            <Link href="/">Ralph</Link>
          </h1>
          <nav className="flex gap-4">
            <Link href="/">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-6 py-8 animate-[fadeIn_0.3s_ease-out]">
        <h2 className="mb-6 text-[22px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
          Import Apple Health Data
        </h2>

        <FileUpload onUploadComplete={handleUploadComplete} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-[15px] font-semibold text-[var(--text-primary)]">
              How to Export Apple Health Data
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[15px] text-[var(--text-secondary)]">
            <ol className="list-inside list-decimal space-y-3">
              <li>Open the <strong className="text-[var(--text-primary)]">Health</strong> app on your iPhone</li>
              <li>Tap your profile picture in the top right</li>
              <li>Scroll down and tap <strong className="text-[var(--text-primary)]">Export All Health Data</strong></li>
              <li>Wait for the export to complete (may take a few minutes)</li>
              <li>Save the ZIP file and upload it here</li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
