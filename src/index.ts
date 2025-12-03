import path from "path";
import { Worker } from "worker_threads";
import { Job } from "./interfaces";
import { Transaction } from "./transasction";
import { sha256 } from "./utils/crypto";

export interface BlockInterface {
  index: number;
  prevHash: string;
  merkleRootHash: string;
  hash: string;
  transactions: Transaction[];
  nonce: number;
  timestamp: string;
  difficulty: number;
}

export class Block implements BlockInterface {
  index: number;
  prevHash: string;
  hash: string;
  merkleRootHash: string;
  transactions: Transaction[];
  nonce: number;
  timestamp: string;
  difficulty: number;

  constructor(
    index: number,
    prevHash: string = "",
    transactions: Transaction[],
    timestamp: string
  ) {
    this.merkleRootHash = this.calculateMerkleRootHash();
    this.index = index;
    this.transactions = transactions;
    this.prevHash = prevHash;
    this.hash = sha256(JSON.stringify(this.blockData));
    this.timestamp = timestamp;
    this.nonce = 0;
    this.difficulty = 4;
  }
  public calculateMerkleRootHash() {
    let hashes: string[] = [];
    this.transactions.map((tx) => {
      const txId = tx.txId;
      hashes.push(txId);
    });
    if (hashes.length === 0) return "0";
    while (hashes.length > 1) {
      const nextLevel: string[] = [];
      if (hashes.length % 2 !== 0) {
        nextLevel.push(hashes[hashes.length - 1]);
        hashes.pop();
      }
      for (let i = 0; i < hashes.length; i += 2) {
        const hash1 = hashes[i];
        const hash2 = hashes[i + 1];
        const combinedHash = sha256(hash1 + hash2);
        nextLevel.push(combinedHash);
      }
      hashes = nextLevel;
    }

    return hashes[0];
  }

  public get headerData() {
    return {
      index: this.index,
      prevHash: this.prevHash,
      timestamp: this.timestamp,
      nonce: this.nonce,
      merkleRootHash: this.merkleRootHash,
      difficulty: this.difficulty,
    };
  }

  public get blockData() {
    return {
      index: this.index,
      prevHash: this.prevHash,
      transactions: this.transactions,
      hash: this.hash,
      timestamp: this.timestamp,
      nonce: this.nonce,
    };
  }

  public verifyBlockHash(): boolean {
    if (this.hash !== sha256(JSON.stringify(this.blockData))) return false;
    if (this.transactions.length === 0) return false;
    return true;
  }

  public async mineBlock(): Promise<boolean> {
    const difficulty = this.difficulty;
    const numberOfWorkers = 10;
    return new Promise((resolve, reject) => {
      const workers: Worker[] = [];
      const startTime = Date.now();
      for (let i = 0; i < numberOfWorkers; i++) {
        const worker = new Worker(path.resolve(__dirname, "worker.js"));
        workers.push(worker);
        const data: Job = {
          index: this.index,
          transactions: this.transactions,
          prevHash: this.prevHash,
          timestamp: this.timestamp,
          difficulty,
          offset: i + 1,
          step: numberOfWorkers,
        };
        worker.postMessage(data);
        let solved = false;
        worker.on("message", (msg) => {
          if (solved) return;
          if (msg.found) {
            solved = true;
            this.hash = msg.hash;
            this.nonce = msg.nonce;
            console.log(`✔ Solution found by worker ${i}`, msg);
            console.log("for data: ", data);
            const endTime = Date.now();
            const executionTime = endTime - startTime;
            console.log(`Execution time: ${executionTime} ms`);

            for (const w of workers) {
              w.postMessage("stop");
            }
            for (const w of workers) {
              w.terminate();
            }
            resolve(true);
          }
        });
        worker.on("error", reject);
        worker.on("exit", reject);
      }
    });
  }
}

async function main() {
  // const block = new Block(
  //   0,
  //   "xxxxxxxxxx",
  //   [
  //     {
  //       amount: 1,
  //       senderAddress: "xxxxxxxxxxxxxxxxxxx",
  //       receiverAddress: "yyyyyyyyyyyyyyyyyyyy",
  //       timestamp: "23-11-2025",
  //     },
  //   ],
  //   "23-11-2025"
  // );
  // await block.mineBlock();
  // console.log("block data: ", block.data);
  // console.log(block.());
  // console.log(block.verifyBlockHash());
}
main();
