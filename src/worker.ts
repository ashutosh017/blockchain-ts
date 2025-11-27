import { parentPort } from "worker_threads";
import { Job } from "./worker-job-type";
import crypto from "crypto";

let shouldStop = false;

parentPort!.on("message", (job: Job | "stop") => {
  if (job === "stop") {
    shouldStop = true;
    return;
  }
  let nonce = job.offset;
  const target = "0".repeat(job.difficulty);

  nonce = job.offset;
  while (!shouldStop) {
    const raw =
      job.index +
      job.prevHash +
      job.transactions.toString() +
      job.timestamp +
      nonce;
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
