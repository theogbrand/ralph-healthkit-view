'use client';

import { useState, useCallback, DragEvent, ChangeEvent } from 'react';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
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
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.zip') && !fileName.endsWith('.xml')) {
      const errorMsg = "That file type isn't supported. Please upload a .zip or .xml file from Apple Health.";
      setUploadMessage(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadMessage('Uploading file...');
    setUploadStats(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

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
        className={`p-8 border-2 border-dashed transition-all duration-200 ${
          isDragging
            ? 'border-solid border-primary bg-primary/5 animate-pulse'
            : 'border-border hover:border-border'
        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          {/* Upload Icon */}
          <div className={`w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-200 ${isDragging ? 'scale-105' : ''}`}>
            <Upload className="size-8 text-primary" />
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Upload Apple Health Export
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drop your Apple Health export here, or browse to select
            </p>
            <p className="text-xs text-muted-foreground">
              .zip or .xml
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
              <span className="text-muted-foreground font-mono tabular-nums">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
            <p className="text-xs text-muted-foreground">{uploadMessage}</p>
          </div>
        </Card>
      )}

      {/* Results */}
      {!isUploading && uploadMessage && (
        <Card className="p-4 animate-in slide-in-from-bottom-4 duration-200">
          <div className="space-y-3">
            <div
              className={`flex items-start space-x-2 ${
                uploadStats ? 'text-positive' : 'text-negative'
              }`}
            >
              {uploadStats ? (
                <CheckCircle className="size-5 mt-0.5 animate-in zoom-in duration-300" />
              ) : (
                <XCircle className="size-5 mt-0.5" />
              )}
              <p className="font-medium">{uploadMessage}</p>
            </div>

            {uploadStats && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Records Imported</p>
                  <p className="text-xl font-bold font-mono tabular-nums text-foreground">
                    {uploadStats.recordsImported.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Workouts Imported</p>
                  <p className="text-xl font-bold font-mono tabular-nums text-foreground">
                    {uploadStats.workoutsImported.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Date Range</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(uploadStats.dateRange.earliest)} -{' '}
                    {formatDate(uploadStats.dateRange.latest)}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Processing Time</p>
                  <p className="text-sm font-medium font-mono text-foreground">
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
