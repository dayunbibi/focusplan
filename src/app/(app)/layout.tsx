import { UiProvider } from "./_lib/ui-store";
import { getCourses, getCurrentUser, getTasks } from "./_lib/queries";
import { AppShell } from "./_components/app-shell";
import { AddTaskSheet } from "./_components/add-task-sheet";
import { FocusOverlay } from "./_components/focus-overlay";
import { KittyFab } from "./_components/kitty-fab";
import { KittyToast } from "./_components/kitty-toast";

export const dynamic = "force-dynamic";

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
  const [user, courses, tasks] = await Promise.all([getCurrentUser(), getCourses(), getTasks()]);
  const courseOptions = courses.map((c) => ({ id: c.id, name: c.name }));

  return (
    <UiProvider>
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
