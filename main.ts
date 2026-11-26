// The Painfully Honest Out-of-Office — make.fun entry.
// Writes one painfully honest (but polite) out-of-office auto-reply to
// /output/entry.txt. The line is a single sentence, 152 characters,
// inside the sealed 1-200 character gate.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "Thank you for your email—I'm out until Monday and deliberately not reading this, because past-me deserves one week where he doesn't know what's waiting.";

const MIN_CHARS = 1;
const MAX_CHARS = 200;

function guard(line: string): void {
  if (line.length < MIN_CHARS || line.length > MAX_CHARS) {
    throw new Error(
      `entry must be ${MIN_CHARS}-${MAX_CHARS} characters, got ${line.length}`,
    );
  }
  if (line.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (line !== line.trim()) {
    throw new Error("entry must not have leading or trailing whitespace");
  }
  // Control characters (other than tab/newline, which a one-liner never has)
  // must never reach the entry file.
  for (const ch of line) {
    const code = ch.codePointAt(0)!;
    if (code < 0x20 || code === 0x7f) {
      throw new Error(
        `entry must not contain control character U+${code.toString(16).padStart(4, "0")}`,
      );
    }
  }
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
guard(LINE);
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, LINE + "\n", "utf8");
// Read-back: the file on disk must be exactly the line plus one newline.
import { readFileSync } from "node:fs";
if (readFileSync(outPath, "utf8") !== LINE + "\n") {
  throw new Error("read-back check failed: entry.txt does not match the line");
}
