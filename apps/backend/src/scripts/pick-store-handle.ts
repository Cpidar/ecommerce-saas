import fs from "fs";
import path from "path";

const POOL_PATH = path.join(__dirname, "store-handle-pool.json");

export function assignId(): string {
  const raw = fs.readFileSync(POOL_PATH, "utf-8");
  const pool: string[] = JSON.parse(raw);

  if (pool.length === 0) {
    throw new Error("ID pool exhausted");
  }

  const id = pool.pop()!;
  fs.writeFileSync(POOL_PATH, JSON.stringify(pool, null, 2));

  return id;
}
