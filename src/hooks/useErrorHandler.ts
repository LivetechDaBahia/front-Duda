import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { ApiError, getLocalizedErrorMessage, parseError } from "@/services/errorService";

type ToastVariant = "default" | "destructive";

interface ErrorHandlerOptions {
  /** Use sonner toast instead of shadcn toast */
  useSonner?: boolean;
}

/**
 * Hook that provides standardized error handling with localized messages.
 * 
 * Usage:
 * ```tsx
 * const { handleError } = useErrorHandler();
 * 
 * const mutation = useMutation({
 *   mutationFn: myApiCall,
 *   onError: handleError,
 * });
 * ```
 */
export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const { t } = useLocale();
  const { toast } = useToast();
  const useSonner = options.useSonner ?? false;

  /**
   * Handle any error and display a localized toast message
   */
  const handleError = (error: unknown) => {
    // Parse the error to get structured information
    const parsedError = error instanceof ApiError 
      ? error.parsed 
      : parseError(error);

    // Get localized messages
    const { title, description } = getLocalizedErrorMessage(parsedError, t);

    if (useSonner) {
      sonnerToast.error(title, { description });
    } else {
      toast({
        variant: "destructive" as ToastVariant,
        title,
        description,
      });
    }
  };

  /**
   * Create an onError handler for mutations with custom fallback title
   */
  const createErrorHandler = (fallbackTitleKey?: string) => {
    return (error: unknown) => {
      const parsedError = error instanceof ApiError 
        ? error.parsed 
        : parseError(error);

      const { title, description } = getLocalizedErrorMessage(parsedError, t);
      
      // Use fallback title if the error code doesn't have a translation
      const finalTitle = title || (fallbackTitleKey ? t(fallbackTitleKey) : "Error");

      if (useSonner) {
        sonnerToast.error(finalTitle, { description });
      } else {
        toast({
          variant: "destructive" as ToastVariant,
          title: finalTitle,
          description,
        });
      }
    };
  };

  return {
    handleError,
    createErrorHandler,
  };
};
