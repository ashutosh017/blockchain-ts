import { parentPort } from "worker_threads";
import crypto from "crypto";

interface Job {
  index: number;
  data: string;
  prevHash: string;
  timestamp: number;
  difficulty: number;
  offset: number; // worker id
  step: number; // total workers
}

parentPort!.on("message", (job: Job) => {
  const target = "0".repeat(job.difficulty);
  let counter = 0;
  let nonce = job.offset;
  while (true) {
    // if (counter % 1000000*job.offset === 0) {
    //   console.log(`Worker ${job.offset} trying nonce ${nonce}`);
    // }
    const raw =
      job.index + job.prevHash + job.timestamp + job.data + nonce.toString();

    const hash = crypto.createHash("sha256").update(raw).digest("hex");

    if (hash.startsWith(target)) {
      parentPort!.postMessage({
        found: true,
        hash,
        nonce,
      });
      return;
    }

    nonce += job.step;
    counter++;
  }
});
