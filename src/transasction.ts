import { sha256 } from "./utils/crypto";

interface TxInputInterface {
  value: number;
}
interface TxOutputInterface {
  value: number;
}

export interface TransactionInterface {
  txId: string;
  txOut: TxOutputInterface[];
  txIn: TxInputInterface[];
}

export class Transaction implements TransactionInterface {
  txId: string;
  txIn: TxInputInterface[];
  txOut: TxOutputInterface[];
  constructor(input: TxInputInterface[], output: TxOutputInterface[]) {
    this.txId = this.generateTxId();
    this.txIn = input;
    this.txOut = output;
  }
  private generateTxId() {
    return sha256(JSON.stringify(this.transactionData));
  }
  get transactionData() {
    return {
      txId: this.txId,
      txIn: this.txIn,
      txOut: this.txOut,
    };
  }
}
