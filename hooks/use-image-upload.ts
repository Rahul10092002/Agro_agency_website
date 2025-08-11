import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseImageUploadProps {
  maxFiles?: number;
  maxSizeInMB?: number;
}

interface UploadResult {
  url: string;
  publicId: string;
}

export function useImageUpload({
  maxFiles = 5,
  maxSizeInMB = 10,
}: UseImageUploadProps = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const { toast } = useToast();

  const uploadFiles = async (files: File[]): Promise<UploadResult[]> => {
    if (files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return [];
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        });
        return false;
      }

      if (file.size > maxSizeInMB * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds ${maxSizeInMB}MB limit`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) {
      return [];
    }

    setIsUploading(true);
    setUploadProgress(new Array(validFiles.length).fill(0));

    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || `Upload failed for ${file.name}`);
        }

        // Update progress for this file
        setUploadProgress((prev) => {
          const newProgress = [...prev];
          newProgress[index] = 100;
          return newProgress;
        });

        return {
          url: result.url,
          publicId: result.publicId,
        };
      });

      const results = await Promise.all(uploadPromises);

      toast({
        title: "Upload successful",
        description: `${results.length} image(s) uploaded successfully`,
      });

      return results;
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during upload",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsUploading(false);
      setUploadProgress([]);
    }
  };

  const uploadSingleFile = async (file: File): Promise<UploadResult | null> => {
    const results = await uploadFiles([file]);
    return results[0] || null;
  };

  return {
    uploadFiles,
    uploadSingleFile,
    isUploading,
    uploadProgress,
  };
}
