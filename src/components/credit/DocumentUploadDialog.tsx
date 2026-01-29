import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/contexts/LocaleContext";
import { Upload, FileUp, X, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { creditService } from "@/services/creditService";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DocumentUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
}

type DocumentType = "A" | "B" | "C" | "D" | "E" | "F";

const DOCUMENT_TYPES: DocumentType[] = ["A", "B", "C", "D", "E", "F"];

// Backend has 50MB JSON body limit; Base64 adds ~33% overhead
// So max original file size should be ~37MB to be safe
const MAX_FILE_SIZE_BYTES = 37 * 1024 * 1024; // 37MB
const MAX_FILE_SIZE_DISPLAY = "37MB";
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

// Compress image using canvas
const compressImage = (file: File, maxSizeBytes: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      let { width, height } = img;
      let quality = 0.8;
      
      // Start with original dimensions, reduce if needed
      canvas.width = width;
      canvas.height = height;
      
      const tryCompress = (currentQuality: number, scale: number): void => {
        canvas.width = width * scale;
        canvas.height = height * scale;
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }

            if (blob.size <= maxSizeBytes || currentQuality <= 0.1 || scale <= 0.3) {
              // Accept this result
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              // Try with lower quality or smaller scale
              if (currentQuality > 0.3) {
                tryCompress(currentQuality - 0.15, scale);
              } else {
                tryCompress(0.5, scale - 0.2);
              }
            }
          },
          "image/jpeg",
          currentQuality
        );
      };

      tryCompress(quality, 1);
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

export const DocumentUploadDialog = ({
  isOpen,
  onClose,
  proposalId,
}: DocumentUploadDialogProps) => {
  const { t } = useLocale();
  const queryClient = useQueryClient();

  const [selectedType, setSelectedType] = useState<DocumentType | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);

  const getDocumentTypeLabel = (type: DocumentType): string => {
    return t(`credit.upload.docType.${type}`);
  };

  const uploadMutation = useMutation({
    mutationFn: async ({
      base64,
      name,
      type,
      proposal,
    }: {
      base64: string;
      name: string;
      type: string;
      proposal: string;
    }) => {
      return creditService.uploadDocument({ base64, name, type, proposal });
    },
    onSuccess: () => {
      toast.success(t("credit.upload.success"));
      // Invalidate document queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["creditDocuments"] });
      queryClient.invalidateQueries({ queryKey: ["creditQuoteDocuments"] });
      queryClient.invalidateQueries({ queryKey: ["creditRentalDocuments"] });
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || t("credit.upload.error"));
    },
  });

  const handleClose = () => {
    setSelectedType("");
    setFile(null);
    setIsDragOver(false);
    setFileSizeError(null);
    onClose();
  };

  const processFile = async (selectedFile: File): Promise<void> => {
    setFileSizeError(null);
    
    // Check if it's an image that can be compressed
    if (IMAGE_TYPES.includes(selectedFile.type)) {
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        setIsCompressing(true);
        try {
          const compressedFile = await compressImage(selectedFile, MAX_FILE_SIZE_BYTES);
          setFile(compressedFile);
          toast.info(t("credit.upload.compressed"));
        } catch {
          setFileSizeError(t("credit.upload.compressionFailed"));
        } finally {
          setIsCompressing(false);
        }
      } else {
        setFile(selectedFile);
      }
    } else {
      // Non-image file - check size limit
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        setFileSizeError(
          t("credit.upload.fileTooLarge").replace("{maxSize}", MAX_FILE_SIZE_DISPLAY)
        );
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFileSizeError(null);
    setFile(null);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!file || !selectedType) return;

    try {
      const base64 = await convertToBase64(file);

      uploadMutation.mutate({
        base64,
        name: file.name,
        type: selectedType,
        proposal: proposalId,
      });
    } catch (error) {
      toast.error(t("credit.upload.error"));
    }
  };

  const canSubmit = file && selectedType && !uploadMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("credit.upload.title")}</DialogTitle>
          <DialogDescription>{t("credit.upload.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Document Type Selector */}
          <div className="space-y-2">
            <Label htmlFor="doc-type">{t("credit.upload.selectType")}</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setSelectedType(value as DocumentType)}
            >
              <SelectTrigger id="doc-type">
                <SelectValue placeholder={t("credit.upload.selectTypePlaceholder")} />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getDocumentTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Drop Zone */}
          <div className="space-y-2">
            <Label>{t("credit.upload.fileLabel")}</Label>
            {isCompressing ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center border-muted-foreground/25">
                <Loader2 className="h-10 w-10 mx-auto mb-3 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Compressing image...
                </p>
              </div>
            ) : !file ? (
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                  fileSizeError
                    ? "border-destructive bg-destructive/5"
                    : isDragOver
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                {fileSizeError ? (
                  <>
                    <AlertCircle className="h-10 w-10 mx-auto mb-3 text-destructive" />
                    <p className="text-sm text-destructive mb-1">
                      {fileSizeError}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("credit.upload.orClick")}
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      {t("credit.upload.dragDrop")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("credit.upload.orClick")}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-2">
                      {t("credit.upload.maxSize").replace("{maxSize}", MAX_FILE_SIZE_DISPLAY)}
                    </p>
                  </>
                )}
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                />
              </div>
            ) : (
              <div className="border rounded-lg p-4 flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-3">
                  <FileUp className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  disabled={uploadMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploadMutation.isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button onClick={handleUpload} disabled={!canSubmit}>
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("credit.upload.uploading")}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {t("credit.upload.uploadButton")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
