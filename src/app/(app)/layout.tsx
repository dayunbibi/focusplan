import { UiProvider } from "./_lib/ui-store";
import { getCourses, getTasks } from "./_lib/queries";
import { requireCurrentUser } from "@/lib/dal/auth";
import { paletteColorAt } from "./_lib/course-colors";
import { AppShell } from "./_components/app-shell";
import { AddTaskSheet } from "./_components/add-task-sheet";
import { ClassSheet } from "./_components/class-sheet";
import { FocusOverlay } from "./_components/focus-overlay";
import { KittyFab } from "./_components/kitty-fab";
import { KittyToast } from "./_components/kitty-toast";

// force-dynamic would also drop these routes from the client router cache and defeat staleTimes.
// The pages are already rendered per request because requireCurrentUser() reads cookies(),
// and revalidatePath in actions.ts keeps data fresh after mutations, so it isn't needed.

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
  const [user, courses, tasks] = await Promise.all([requireCurrentUser(), getCourses(), getTasks()]);
  const courseOptions = courses.map((c) => ({ id: c.id, name: c.name }));

  return (
    <UiProvider timezone={user.timezone}>
      <AppShell
        userInitial={(user.name ?? user.email).trim().charAt(0).toUpperCase()}
        overlays={
          <>
            <KittyFab nextClassColor={paletteColorAt(courses.length)} />
            <AddTaskSheet courses={courseOptions} />
            <ClassSheet />
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
