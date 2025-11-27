export interface Job {
  index: number;
  prevHash: string;
  transactions: string[];
  timestamp: string;
  difficulty: number;
  offset: number; // worker id
  step: number; // total workers
}
