import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { FeaturePlaceholder } from "../_components/feature-placeholder";

export const metadata: Metadata = { title: "설정" };
export default function SettingsPage() {
  return <FeaturePlaceholder title="설정" description="프로필, 알림, 학기 정보를 설정하세요." icon={Settings} />;
}
