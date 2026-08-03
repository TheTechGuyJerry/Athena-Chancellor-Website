import { spawn } from "node:child_process";

const rawArgs = process.argv.slice(2);
const args = ["dev"];

let hasPort = false;
let hasHost = false;

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === "--host") {
    hasHost = true;
    if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith("-")) {
      args.push("-H", rawArgs[i + 1]);
      i++;
    } else {
      args.push("-H", "0.0.0.0");
    }
  } else if (arg.startsWith("--host=")) {
    hasHost = true;
    args.push("-H", arg.split("=")[1] || "0.0.0.0");
  } else if (arg === "-p" || arg === "--port" || arg.startsWith("-p") || arg.startsWith("--port=")) {
    hasPort = true;
    args.push(arg);
  } else {
    args.push(arg);
  }
}

if (!hasPort) {
  args.push("-p", "3000");
}
if (!hasHost) {
  args.push("-H", "0.0.0.0");
}

const child = spawn("npx", ["next", ...args], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
