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

  let nonce = job.offset;
  while (true) {
    console.log("trying nonce: ", nonce, ", by worker: ", job.offset);
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
  }
});
