import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/orderService";
import {
  DetailedPurchaseOrder,
  ApprovalLevel,
  CostCenter,
  ApiDetailedOrder,
  ApiApprovalLevelsResponse,
  ApiCostCenterResponse,
} from "@/types/order";
import {
  transformApiDetailedOrder,
  transformApiApprovalLevels,
  transformApiCostCenters,
} from "@/lib/orderDetailTransformer";

interface UseOrderDetailsParams {
  orderId: string;
  branch: string;
  enabled: boolean;
}

interface UseOrderDetailsReturn {
  orderDetails: DetailedPurchaseOrder | undefined;
  approvalLevels: ApprovalLevel[] | undefined;
  costCenters: CostCenter[] | undefined;
  isLoading: boolean;
  isLoadingOrder: boolean;
  isLoadingApprovals: boolean;
  isLoadingCostCenters: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useOrderDetails = ({
  orderId,
  branch,
  enabled,
}: UseOrderDetailsParams): UseOrderDetailsReturn => {
  // Fetch detailed order info
  const {
    data: rawOrderDetails,
    isLoading: isLoadingOrder,
    error: orderError,
    refetch: refetchOrder,
  } = useQuery<ApiDetailedOrder>({
    queryKey: ["orderDetails", orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: enabled && !!orderId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch approval levels
  const {
    data: rawApprovalLevels,
    isLoading: isLoadingApprovals,
    error: approvalsError,
    refetch: refetchApprovals,
  } = useQuery<ApiApprovalLevelsResponse>({
    queryKey: ["approvalLevels", orderId, branch],
    queryFn: () => orderService.getApprovalLevels(orderId, branch),
    enabled: enabled && !!orderId && !!branch,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch cost center details
  const {
    data: rawCostCenters,
    isLoading: isLoadingCostCenters,
    error: costCentersError,
    refetch: refetchCostCenters,
  } = useQuery<ApiCostCenterResponse>({
    queryKey: ["costCenters", orderId],
    queryFn: () => orderService.getCostCenterDetails(orderId),
    enabled: enabled && !!orderId,
    staleTime: 5 * 60 * 1000,
  });

  // Transform API data to UI format
  const orderDetails = rawOrderDetails
    ? transformApiDetailedOrder(rawOrderDetails)
    : undefined;

  const approvalLevels = rawApprovalLevels?.levels
    ? transformApiApprovalLevels(rawApprovalLevels.levels)
    : undefined;

  const costCenters = rawCostCenters?.costCenters
    ? transformApiCostCenters(rawCostCenters.costCenters)
    : undefined;

  // Combine refetch functions
  const refetch = () => {
    refetchOrder();
    refetchApprovals();
    refetchCostCenters();
  };

  return {
    orderDetails,
    approvalLevels,
    costCenters,
    isLoading: isLoadingOrder || isLoadingApprovals || isLoadingCostCenters,
    isLoadingOrder,
    isLoadingApprovals,
    isLoadingCostCenters,
    error: (orderError || approvalsError || costCentersError) as Error | null,
    refetch,
  };
};
