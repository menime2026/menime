"use client";

import { Button } from "@/components/ui/button";
import { useImageKitUpload } from "@/hooks/use-imagekit-upload";
import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  folder?: string;
}

export const ImageUpload = ({
  value,
  onChange,
  onRemove,
  disabled,
  folder = "homepage",
}: ImageUploadProps) => {
  const { uploadFiles, isUploading } = useImageKitUpload({ folder });

  const onUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const { results, failed } = await uploadFiles(files);

        if (failed.length > 0) {
          toast.error("Failed to upload image");
        }

        if (results.length > 0) {
          onChange(results[0].url);
          toast.success("Image uploaded successfully");
        }
      } catch (error) {
        toast.error("Something went wrong during upload");
      }
    },
    [onChange, uploadFiles]
  );

  if (value) {
    return (
      <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden border border-slate-200">
        <div className="absolute top-2 right-2 z-10">
          <Button
            type="button"
            onClick={() => {
              onChange("");
              onRemove?.();
            }}
            variant="destructive"
            size="icon"
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Image
          fill
          className="object-cover"
          alt="Image"
          src={value}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex flex-col items-center justify-center w-[200px] h-[200px] border-2 border-dashed border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer">
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={onUpload}
          disabled={disabled || isUploading}
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            <span className="text-sm text-slate-500">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ImagePlus className="h-8 w-8 text-slate-400" />
            <span className="text-sm text-slate-500">Upload Image</span>
          </div>
        )}
      </div>
    </div>
  );
};
