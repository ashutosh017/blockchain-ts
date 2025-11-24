import sha256 from "crypto-js/sha256";
import path from "path";
import { Worker } from "worker_threads";

export interface BlockData {
  timestamp: string;
  transactions: string[];
}

export class Block {
  index: number;
  prevHash: string;
  hash: string;
  data: BlockData;
  nonce: number;
  timestamp: string;

  constructor(
    index: number,
    prevHash: string = ``,
    data: BlockData,
    timestamp: string
  ) {
    this.index = index;
    this.data = data;
    this.prevHash = prevHash;
    this.hash = this.calculateHash();
    this.timestamp = timestamp;
    this.nonce = 0;
  }

  public calculateHash(): string {
    const hash = sha256(
      this.nonce +
        this.index +
        JSON.stringify(this.data) +
        this.prevHash +
        this.timestamp
    ).toString();

    return hash;
  }

  public mineBlock(difficulty: number): void {
    const numberOfWorkers = 5;
    const workers: Worker[] = [];
    for (let i = 0; i < numberOfWorkers; i++) {
      const worker = new Worker(path.resolve(__dirname, "worker.js"));
      workers.push(worker);
      worker.postMessage({
        index: this.index,
        data: JSON.stringify(this.data),
        prevHash: this.prevHash,
        timestamp: this.timestamp,
        difficulty,
        offset: i + 1,
        step: numberOfWorkers,
      });
      let solved = false;
      worker.on("message", (msg) => {
        if (solved) return;
        if (msg.found) {
          solved = true;
          this.hash = msg.hash;
          this.nonce = msg.nonce;
          console.log(`✔ Solution found by worker ${i}`, msg);
          for (const w of workers) {
            w.terminate();
          }
        }
      });
    //   worker.on("error", () => {});
    //   worker.on("exit", () => {});
    }
  }
}

const block = new Block(
  0,
  "xxxxxxxxxx",
  {
    transactions: [""],
    timestamp: "23-11-2025",
  },
  "23-11-2025"
);
block.mineBlock(5);
