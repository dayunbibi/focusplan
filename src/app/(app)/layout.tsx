import { UiProvider } from "./_lib/ui-store";
import { getCourses, getTasks } from "./_lib/queries";
import { requireCurrentUser } from "@/lib/dal/auth";
import { AppShell } from "./_components/app-shell";
import { AddTaskSheet } from "./_components/add-task-sheet";
import { FocusOverlay } from "./_components/focus-overlay";
import { KittyFab } from "./_components/kitty-fab";
import { KittyToast } from "./_components/kitty-toast";

// force-dynamic 는 라우트를 클라이언트 라우터 캐시에서까지 제외시켜 staleTimes 가 무력화된다.
// 이 페이지들은 requireCurrentUser() 가 cookies() 를 읽어 어차피 요청마다 동적 렌더되고,
// mutation 후 최신성은 actions.ts 의 revalidatePath 가 보장하므로 이 선언은 불필요.

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
  const [user, courses, tasks] = await Promise.all([requireCurrentUser(), getCourses(), getTasks()]);
  const courseOptions = courses.map((c) => ({ id: c.id, name: c.name }));

  return (
    <UiProvider timezone={user.timezone}>
      <AppShell
        userInitial={(user.name ?? user.email).trim().charAt(0).toUpperCase()}
        overlays={
          <>
            <KittyFab />
            <AddTaskSheet courses={courseOptions} />
            <FocusOverlay tasks={tasks} />
            <KittyToast />
          </>
        }
      >
        {children}
      </AppShell>
    </UiProvider>
  );
}
