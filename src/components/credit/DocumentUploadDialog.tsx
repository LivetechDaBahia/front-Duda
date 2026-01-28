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
import { Upload, FileUp, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { creditService } from "@/services/creditService";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import formatOfferId from "@/utils/offer";

interface DocumentUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
}

type DocumentType = "A" | "B" | "C" | "D" | "E" | "F";

const DOCUMENT_TYPES: DocumentType[] = ["A", "B", "C", "D", "E", "F"];

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
    onClose();
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
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
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
      // Format proposal ID: remove branch and revision (01-825295/00 -> 825295)
      const cleanProposalId = formatOfferId(proposalId);

      uploadMutation.mutate({
        base64,
        name: file.name,
        type: selectedType,
        proposal: cleanProposalId,
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
            {!file ? (
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">
                  {t("credit.upload.dragDrop")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("credit.upload.orClick")}
                </p>
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
