"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/use-image-upload";
import Image from "next/image";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  label?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  label = "Images",
  disabled = false,
}: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { uploadFiles, isUploading } = useImageUpload({ maxFiles: maxImages });

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || disabled || isUploading) return;

    const fileArray = Array.from(files);
    if (value.length + fileArray.length > maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive",
      });
      return;
    }

    const results = await uploadFiles(fileArray);
    if (results.length > 0) {
      const newUrls = results.map((result) => result.url);
      onChange([...value, ...newUrls]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const addImageUrl = () => {
    onChange([...value, ""]);
  };

  const updateImageUrl = (index: number, url: string) => {
    const newImages = [...value];
    newImages[index] = url;
    onChange(newImages);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Label className="font-hindi">{label}</Label>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400"
        } ${
          disabled || isUploading
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled || isUploading}
        />

        <div className="flex flex-col items-center space-y-2">
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}
          <p className="text-sm text-gray-600 font-hindi">
            {isUploading
              ? "तस्वीरें अपलोड हो रही हैं..."
              : "तस्वीरें अपलोड करने के लिए यहाँ क्लिक करें या खींचकर छोड़ें"}
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, JPEG up to 10MB (Max {maxImages} images)
          </p>
        </div>
      </div>

      {/* Preview Images */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((imageUrl, index) => (
            <div
              key={index}
              className="relative group border rounded-lg overflow-hidden bg-gray-50"
            >
              {imageUrl ? (
                <>
                  <div className="aspect-square relative">
                    <Image
                      src={imageUrl}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="aspect-square p-2">
                  <Input
                    value={imageUrl}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                    placeholder="Image URL"
                    className="h-full"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 p-1 h-auto"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Manual URL Input */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={addImageUrl}
          disabled={disabled || value.length >= maxImages || isUploading}
          className="font-hindi bg-transparent"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          URL से जोड़ें
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={disabled || value.length >= maxImages || isUploading}
          className="font-hindi bg-transparent"
        >
          <Upload className="h-4 w-4 mr-2" />
          फाइल अपलोड करें
        </Button>
      </div>

      {value.length >= maxImages && (
        <p className="text-sm text-gray-500 font-hindi">
          अधिकतम {maxImages} तस्वीरें जोड़ी जा सकती हैं
        </p>
      )}
    </div>
  );
}
