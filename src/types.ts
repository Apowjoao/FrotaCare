export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'open' | 'in_progress' | 'completed' | 'cancelled';

export interface Ticket {
  id: string;
  operatorName: string;
  sector: string;
  forkliftId: string;
  problemType: string;
  description: string;
  priority: Priority;
  status: Status;
  createdAt: string;
}

export interface DashboardStats {
  open: number;
  inProgress: number;
  completed: number;
  totalMaintenance: number;
}
