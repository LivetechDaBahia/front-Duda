import { create } from "zustand";
import type {
  SalesElementItem,
  SalesFilters,
  SalesSearchType,
} from "@/types/sales";

type SalesView = "kanban" | "table";
type SalesDateSort = "asc" | "desc";

const initialFilters: SalesFilters = {
  search: "",
  status: "all",
  type: "",
  seller: "",
  name: "",
  sellerGroup: "",
  salesGroup: "",
};

interface SalesUIState {
  view: SalesView;
  dateSort: SalesDateSort;
  activeSearchType: SalesSearchType;
  allocationCodeSearch: string;
  submittedAllocationCode: string;
  allocationSearchRequestId: number;
  allocationSearchDialogOpen: boolean;
  showFilters: boolean;
  selectedItem: SalesElementItem | null;
  assignItem: SalesElementItem | null;
  filters: SalesFilters;
  setView: (view: SalesView) => void;
  setDateSort: (sort: SalesDateSort) => void;
  setActiveSearchType: (type: SalesSearchType) => void;
  setAllocationCodeSearch: (value: string) => void;
  submitAllocationCodeSearch: (value?: string) => void;
  closeAllocationSearchDialog: () => void;
  setShowFilters: (show: boolean) => void;
  updateFilter: (key: keyof SalesFilters, value: string) => void;
  clearFilters: () => void;
  setSelectedItem: (item: SalesElementItem | null) => void;
  setAssignItem: (item: SalesElementItem | null) => void;
  resetState: () => void;
}

const initialState = {
  view: "kanban" as SalesView,
  dateSort: "desc" as SalesDateSort,
  activeSearchType: "offerClient" as SalesSearchType,
  allocationCodeSearch: "",
  submittedAllocationCode: "",
  allocationSearchRequestId: 0,
  allocationSearchDialogOpen: false,
  showFilters: false,
  selectedItem: null,
  assignItem: null,
  filters: initialFilters,
};

export const useSalesUIStore = create<SalesUIState>((set) => ({
  ...initialState,
  setView: (view) => set({ view }),
  setDateSort: (dateSort) => set({ dateSort }),
  setActiveSearchType: (activeSearchType) =>
    set((state) => ({
      activeSearchType,
      showFilters:
        activeSearchType === "offerClient" ? state.showFilters : false,
    })),
  setAllocationCodeSearch: (allocationCodeSearch) =>
    set({ allocationCodeSearch: String(allocationCodeSearch ?? "") }),
  submitAllocationCodeSearch: (value) =>
    set((state) => {
      const searchValue = String(value ?? state.allocationCodeSearch).trim();

      if (!searchValue) {
        return state;
      }

      return {
        allocationCodeSearch: searchValue,
        submittedAllocationCode: searchValue,
        allocationSearchRequestId: state.allocationSearchRequestId + 1,
        allocationSearchDialogOpen: true,
      };
    }),
  closeAllocationSearchDialog: () => set({ allocationSearchDialogOpen: false }),
  setShowFilters: (showFilters) => set({ showFilters }),
  updateFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: String(value ?? ""),
      },
    })),
  clearFilters: () =>
    set({
      filters: initialFilters,
      showFilters: false,
    }),
  setSelectedItem: (selectedItem) => set({ selectedItem }),
  setAssignItem: (assignItem) => set({ assignItem }),
  resetState: () => set(initialState),
}));
