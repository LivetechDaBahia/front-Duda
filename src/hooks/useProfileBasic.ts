import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface BasicProfile {
  position: string | null;
  name: string | null;
  role: string | null;
  department: string | null;
}

const fetchProfileBasic = async (): Promise<BasicProfile> => {
  const response = await fetch(`${API_BASE_URL}/auth/profile-basic`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (response.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`Failed to load profile: ${response.status}`);
  }

  return response.json();
};

export const useProfileBasic = () => {
  return useQuery<BasicProfile, Error>({
    queryKey: ["profile-basic"],
    queryFn: fetchProfileBasic,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
