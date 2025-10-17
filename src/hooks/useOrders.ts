import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/orderService";
import { PurchaseOrder, UIOrderStatus } from "@/types/order";
import { mockOrders } from "@/data/mockOrders";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== "false";

interface UseOrdersReturn {
  orders: PurchaseOrder[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  updateStatus: (params: { orderId: string; status: UIOrderStatus }) => void;
  approveOrder: (orderId: string) => void;
  declineOrder: (orderId: string) => void;
  isUpdating: boolean;
}

export const useOrders = (): UseOrdersReturn => {
  const queryClient = useQueryClient();
  const { t } = useLocale();

  const {
    data: orders = [],
    isLoading,
    error,
    refetch,
  } = useQuery<PurchaseOrder[], Error>({
    queryKey: ["orders"],
    queryFn: async (): Promise<PurchaseOrder[]> => {
      if (USE_MOCK_DATA) {
        return new Promise<PurchaseOrder[]>((resolve) => {
          setTimeout(() => resolve(mockOrders), 500);
        });
      }
      // TODO: Replace with actual API parameters
      return orderService.getOrders("", "", "", "", "") as any;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: UIOrderStatus;
    }) => {
      if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
          setTimeout(() => resolve({ orderId, status }), 300);
        });
      }
      return orderService.updateOrderStatus(orderId, status as any);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(
        `${t("order.statusUpdated")} ${t(`status.${variables.status}`)}`,
      );
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const approveMutation = useMutation({
    mutationFn: (orderId: string) => {
      if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
          setTimeout(() => resolve({ orderId, status: "approved" }), 300);
        });
      }
      return orderService.approveOrder(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(t("login.success"));
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const declineMutation = useMutation({
    mutationFn: (orderId: string) => {
      if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
          setTimeout(() => resolve({ orderId, status: "declined" }), 300);
        });
      }
      return orderService.declineOrder(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(t("login.success"));
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  return {
    orders,
    isLoading,
    error,
    refetch,
    updateStatus: updateStatusMutation.mutate,
    approveOrder: approveMutation.mutate,
    declineOrder: declineMutation.mutate,
    isUpdating:
      updateStatusMutation.isPending ||
      approveMutation.isPending ||
      declineMutation.isPending,
  };
};
