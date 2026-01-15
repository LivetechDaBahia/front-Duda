// Access request DTO for submitting to backend
export interface AccessRequestDto {
  email: string;
  departmentId?: string; // UUID if selected from list
  departmentName?: string; // Custom name if not in list
  positionId?: string; // UUID if selected from list
  positionName?: string; // Custom name if not in list
  supervisorName: string;
}

// Response from backend
export interface AccessRequestResponse {
  success: boolean;
  message?: string;
}
