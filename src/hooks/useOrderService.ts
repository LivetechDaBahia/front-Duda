import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { initializeOrderService } from "@/services/orderService";

/**
 * Hook to initialize the order service with authentication token
 * This should be called once at the app level to ensure the orderService
 * has access to the current authentication token
 */
export const useOrderService = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    initializeOrderService(getToken);
  }, [getToken]);
};
