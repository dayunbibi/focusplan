import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Every (app) route reads cookies (requireCurrentUser), so it renders dynamically and the
    // client router cache keeps it for 0 seconds, showing loading.tsx on every tab switch.
    // Restore the pre-Next 15 default (30s) so recently visited tabs switch instantly.
    // revalidatePath in actions.ts clears this cache after mutations, so data stays fresh.
    staleTimes: { dynamic: 30 },
  },
};

export default nextConfig;
