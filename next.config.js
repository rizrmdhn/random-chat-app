/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  serverExternalPackages: [
    "@node-rs/argon2",
    "@node-rs/argon2-wasm32-wasi",
    "bcrypt",
  ],

  experimental: {
    reactCompiler: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default config;
