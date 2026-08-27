import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // All demo media is committed locally so seeded flows work offline.
  images: { unoptimized: true },

  /*
   * Pin the file-tracing root to this project.
   *
   * `pnpm-workspace.yaml` lives at the repo root (it is where pnpm 10+ requires
   * `onlyBuiltDependencies` to be declared). Its presence makes Next infer a
   * monorepo and walk upwards looking for the workspace root, which on a build
   * host resolves above the project directory. Traced paths then point outside
   * the deployment and the packaging step that turns the build into functions
   * fails after the build itself has already succeeded.
   *
   * `process.cwd()` is the directory containing this config during `next build`
   * in both module systems, so this stays correct locally and on Vercel.
   */
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
