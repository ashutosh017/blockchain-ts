import path from "path";
import { Worker } from "worker_threads";
import crypto from "crypto";
import { Job } from "./worker-job-type";

interface BlockInterface {
  index: number;
  prevHash: string;
  hash: string;
  transactions: string[];
  nonce: number;
  timestamp: string;
  difficulty: number;
}

export class Block implements BlockInterface {
  public index: number;
  public prevHash: string;
  public hash: string;
  public transactions: string[];
  public nonce: number;
  public timestamp: string;
  public difficulty: number;

  constructor(
    index: number,
    prevHash: string = "",
    transactions: string[],
    timestamp: string
  ) {
    this.index = index;
    this.transactions = transactions;
    this.prevHash = prevHash;
    this.hash = this.calculateHash();
    this.timestamp = timestamp;
    this.nonce = 0;
    this.difficulty = 4;
  }

  public calculateHash(): string {
    const raw =
      this.index +
      this.transactions.toString() +
      this.prevHash +
      this.timestamp +
      this.nonce;
    const hash = crypto.createHash("sha256").update(raw).digest("hex");
    return hash;
  }

  public getBlockData() {
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
    if (this.hash !== this.calculateHash()) return false;
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
  const block = new Block(0, "xxxxxxxxxx", [""], "23-11-2025");
  await block.mineBlock();

  console.log("block data: ", block.getBlockData());
  console.log(block.calculateHash());
  console.log(block.verifyBlockHash());
}
main();
