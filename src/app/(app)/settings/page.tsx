import type { Metadata } from "next";
import { SettingsView } from "../_components/settings-view";
import { getSettings } from "../_lib/queries";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const data = await getSettings();
  return <SettingsView data={data} />;
}
