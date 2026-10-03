import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev server is reached through the coshell port proxy, which is a different origin.
  allowedDevOrigins: ["*.coshell.ai"],
  serverExternalPackages: [
    "@ai-sdk/harness",
    "@ai-sdk/harness-claude-code",
    "@ai-sdk/sandbox-vercel",
    "@electric-sql/pglite",
  ],
};

export default nextConfig;
