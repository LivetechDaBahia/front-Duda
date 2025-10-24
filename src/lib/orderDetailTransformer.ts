import {
  ApiDetailedOrder,
  ApiProduct,
  ApiApprovalLevel,
  ApiCostCenter,
  DetailedPurchaseOrder,
  Product,
  ApprovalLevel,
  CostCenter,
} from "@/types/order";

// Convert date string to Date object
const convertStringToDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();

  // Handle dd/MM/yyyy format
  if (dateStr.includes("/")) {
    const [day, month, year] = dateStr.split("/");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Handle ISO format
  return new Date(dateStr);
};

// Get status description from status code
const getStatusDescription = (statusCode: string): string => {
  switch (statusCode) {
    case "01":
      return "Waiting Previous Level";
    case "02":
      return "Pending";
    case "03":
      return "Approved";
    case "04":
      return "Blocked";
    case "05":
      return "Approved by Other Approver";
    case "06":
      return "Rejected";
    case "07":
      return "Rejected/Blocked by Other Approver";
    default:
      return "Unknown";
  }
};

// Transform API detailed order to UI format
export const transformApiDetailedOrder = (
  apiOrder: ApiDetailedOrder,
): DetailedPurchaseOrder => {
  return {
    id: apiOrder.orderNumber,
    branch: apiOrder.branch,
    createdAt: convertStringToDate(apiOrder.dateOfCreate),
    supplierCode: apiOrder.supplierCode,
    supplierBranch: apiOrder.supplierBranch,
    supplierName: apiOrder.supplierName,
    shortenedSupplierName: apiOrder.shortenedName,
    paymentCode: apiOrder.paymentCode,
    paymentDescription: apiOrder.paymentDescription,
    totalValue: apiOrder.totalValue || 0,
    coinSymbol: apiOrder.coinSymbol || "$",
    buyerCode: apiOrder.buyerCode,
    buyerName: apiOrder.buyerName,
    items: transformApiProducts(apiOrder.itens || []),
  };
};

// Transform API products to UI format
export const transformApiProducts = (apiProducts: ApiProduct[]): Product[] => {
  return apiProducts.map((apiProduct) => ({
    item: apiProduct.item || "",
    id: apiProduct.productCode || "",
    description: apiProduct.productDescription || "",
    partNumber: apiProduct.partNumber || "",
    unit: apiProduct.unit || "",
    amount: apiProduct.amount || 0,
    unitValue: apiProduct.unitPrice || 0,
    totalValue: apiProduct.totalPrice || 0,
    costCenter: apiProduct.costCenter || "",
    accountingCode: apiProduct.Accounting || "",
  }));
};

// Transform API approval levels to UI format
export const transformApiApprovalLevels = (
  apiLevels: ApiApprovalLevel[],
): ApprovalLevel[] => {
  return apiLevels.map((apiLevel) => ({
    role: apiLevel.role || "Unknown",
    date: apiLevel.date ? convertStringToDate(apiLevel.date) : null,
    level: apiLevel.level || 0,
    status: apiLevel.status || "",
    statusDescription: getStatusDescription(apiLevel.status),
  }));
};

// Transform API cost centers to UI format
export const transformApiCostCenters = (
  apiCostCenters: ApiCostCenter[],
): CostCenter[] => {
  return apiCostCenters.map((apiCenter) => ({
    id: apiCenter.id || "",
    description: apiCenter.description || "",
    totalValue: apiCenter.totalValue || 0,
    percentage: apiCenter.percentage || 0,
  }));
};
