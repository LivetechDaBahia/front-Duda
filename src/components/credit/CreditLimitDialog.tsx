import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { creditService } from "@/services/creditService";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreditLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientCnpj: string;
  onSuccess?: () => void;
}

export function CreditLimitDialog({
  open,
  onOpenChange,
  clientCnpj,
  onSuccess,
}: CreditLimitDialogProps) {
  const { t } = useLocale();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [limit, setLimit] = useState("");
  const [risk, setRisk] = useState("");
  const [dueDate, setDueDate] = useState<Date>();

  const mutation = useMutation({
    mutationFn: (payload: {
      cnpj: string;
      limit: number;
      risk: string;
      dueDate: Date;
    }) => creditService.setCreditLimit(payload),
    onSuccess: () => {
      toast({
        title: t("credit.limit.successTitle"),
        description: t("credit.limit.successDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["credit-limit"] });
      queryClient.invalidateQueries({ queryKey: ["credit-client-details"] });
      onOpenChange(false);
      setLimit("");
      setRisk("");
      setDueDate(undefined);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: t("credit.limit.errorTitle"),
        description: error.message || t("credit.limit.errorDesc"),
      });
    },
  });

  const handleSubmit = () => {
    if (!limit || !risk || !dueDate) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("credit.limit.fillAllFields"),
      });
      return;
    }

    const limitValue = parseFloat(limit);
    if (isNaN(limitValue) || limitValue <= 0) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("credit.limit.invalidLimit"),
      });
      return;
    }

    mutation.mutate({
      cnpj: clientCnpj,
      limit: limitValue,
      risk,
      dueDate,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("credit.limit.title")}</DialogTitle>
          <DialogDescription>{t("credit.limit.description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="limit">{t("credit.limit.limitLabel")}</Label>
            <Input
              id="limit"
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="risk">{t("credit.limit.riskLabel")}</Label>
            <Select value={risk} onValueChange={setRisk}>
              <SelectTrigger id="risk">
                <SelectValue placeholder={t("credit.limit.selectRisk")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">{t("credit.limit.riskA")}</SelectItem>
                <SelectItem value="B">{t("credit.limit.riskB")}</SelectItem>
                <SelectItem value="C">{t("credit.limit.riskC")}</SelectItem>
                <SelectItem value="D">{t("credit.limit.riskD")}</SelectItem>
                <SelectItem value="E">{t("credit.limit.riskE")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>{t("credit.limit.dueDateLabel")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? (
                    format(dueDate, "PPP")
                  ) : (
                    <span>{t("credit.limit.selectDate")}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? t("common.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
