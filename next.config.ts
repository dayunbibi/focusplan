import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 모든 (app) 라우트가 쿠키(requireCurrentUser)를 읽어 동적 렌더로 빠지므로
    // 클라이언트 라우터 캐시가 동적 세그먼트를 0초만 보관 → 탭 전환마다 loading.tsx.
    // Next 15 이전 기본값(30s)으로 되돌려 최근 방문한 탭은 재렌더 없이 즉시 전환.
    // mutation 후에는 actions.ts 의 revalidatePath 가 이 캐시도 비우므로 최신성 유지됨.
    staleTimes: { dynamic: 30 },
  },
};

export default nextConfig;
