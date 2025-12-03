import { Transaction } from "./transasction";

export interface Job {
  index: number;
  prevHash: string;
  transactions: Transaction[];
  timestamp: string;
  difficulty: number;
  offset: number;
  step: number;
}
