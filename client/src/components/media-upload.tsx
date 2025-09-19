import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface MediaUploadProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onUpload,
  maxFiles = 5,
  acceptedTypes = ['image/*', 'video/*'],
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = acceptedFiles.map(async (file, index) => {
        const path = `blog-media/${Date.now()}-${file.name}`;
        const url = await uploadFile(file, path);
        
        // Update progress
        const progress = ((index + 1) / acceptedFiles.length) * 100;
        setUploadProgress(progress);
        
        return url;
      });

      const urls = await Promise.all(uploadPromises);
      onUpload(urls);

      toast({
        title: "Upload successful",
        description: `${urls.length} file(s) uploaded successfully.`,
      });
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    disabled: uploading,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        data-testid="media-upload-dropzone"
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <i className="fas fa-cloud-upload-alt text-4xl text-muted-foreground"></i>
          <div>
            <p className="text-lg font-medium text-foreground mb-2">
              {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports images (JPG, PNG, GIF) and videos (MP4, MOV)
            </p>
            <Button 
              type="button" 
              variant="outline" 
              disabled={uploading}
              data-testid="button-choose-files"
            >
              {uploading ? 'Uploading...' : 'Choose Files'}
            </Button>
          </div>
        </div>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading files...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}
    </div>
  );
};