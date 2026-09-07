export function DashboardCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[20px] border border-border bg-surface/95 shadow-[0_8px_22px_rgba(140,80,96,0.055)] ${className}`}>
      {children}
    </section>
  );
}
