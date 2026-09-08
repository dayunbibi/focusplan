import { getCurrentUser, getDashboard } from "./_lib/queries";
import { TodayView } from "./_components/today-view";

export default async function TodayPage() {
  const [user, data] = await Promise.all([getCurrentUser(), getDashboard()]);
  return <TodayView name={user.name ?? "학생"} data={data} />;
}
