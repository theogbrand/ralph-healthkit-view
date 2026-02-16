'use client';

/**
 * File Upload Component
 *
 * Drag-and-drop file upload for Apple Health exports
 * Supports .zip and .xml files
 */

import { useState, useCallback, DragEvent, ChangeEvent } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  onUploadComplete?: (stats: ImportStats) => void;
  onUploadError?: (error: string) => void;
}

interface ImportStats {
  recordsImported: number;
  workoutsImported: number;
  recordsSkipped: number;
  workoutsSkipped: number;
  dateRange: {
    earliest: string;
    latest: string;
  };
  processingTimeMs: number;
}

interface ImportResponse {
  success: boolean;
  message: string;
  stats?: ImportStats;
  error?: string;
}

export function FileUpload({ onUploadComplete, onUploadError }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadStats, setUploadStats] = useState<ImportStats | null>(null);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await uploadFile(files[0]);
      }
    },
    []
  );

  const handleFileSelect = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  }, []);

  const uploadFile = async (file: File) => {
    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.zip') && !fileName.endsWith('.xml')) {
      const errorMsg = 'Invalid file type. Please upload a .zip or .xml file.';
      setUploadMessage(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadMessage('Uploading file...');
    setUploadStats(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress (since we can't track actual upload progress easily)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      // Upload file
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result: ImportResponse = await response.json();

      if (result.success && result.stats) {
        setUploadMessage(result.message);
        setUploadStats(result.stats);
        onUploadComplete?.(result.stats);
      } else {
        const errorMsg = result.error || 'Upload failed';
        setUploadMessage(`Error: ${errorMsg}`);
        onUploadError?.(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setUploadMessage(`Error: ${errorMsg}`);
      onUploadError?.(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-4">
      <Card
        className={`p-8 border-dashed transition-colors ${
          isDragging
            ? 'bg-accent/10'
            : ''
        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          {/* Upload Icon */}
          <div className="w-16 h-16 border-2 border-foreground bg-accent/10 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wide mb-2">
              Upload Apple Health Export
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop your export.zip file here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports .zip and .xml files
            </p>
          </div>

          {/* Browse Button */}
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".zip,.xml"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <label htmlFor="file-upload">
              <Button asChild disabled={isUploading}>
                <span className="cursor-pointer">Browse Files</span>
              </Button>
            </label>
          </div>
        </div>
      </Card>

      {/* Progress */}
      {isUploading && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Processing...</span>
              <span className="text-muted-foreground font-bold">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
            <p className="text-xs text-muted-foreground font-medium">{uploadMessage}</p>
          </div>
        </Card>
      )}

      {/* Results */}
      {!isUploading && uploadMessage && (
        <Card className="p-4">
          <div className="space-y-3">
            <div
              className={`flex items-start space-x-2 ${
                uploadStats ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {uploadStats ? (
                <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <p className="font-medium">{uploadMessage}</p>
            </div>

            {uploadStats && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 border-2 border-foreground bg-muted shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                  <p className="text-muted-foreground font-bold uppercase text-xs">Records Imported</p>
                  <p className="text-xl font-black">
                    {uploadStats.recordsImported.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 border-2 border-foreground bg-muted shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                  <p className="text-muted-foreground font-bold uppercase text-xs">Workouts Imported</p>
                  <p className="text-xl font-black">
                    {uploadStats.workoutsImported.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 border-2 border-foreground bg-muted shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                  <p className="text-muted-foreground font-bold uppercase text-xs">Date Range</p>
                  <p className="text-sm font-bold">
                    {formatDate(uploadStats.dateRange.earliest)} -{' '}
                    {formatDate(uploadStats.dateRange.latest)}
                  </p>
                </div>
                <div className="p-3 border-2 border-foreground bg-muted shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                  <p className="text-muted-foreground font-bold uppercase text-xs">Processing Time</p>
                  <p className="text-sm font-bold">
                    {formatTime(uploadStats.processingTimeMs)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
