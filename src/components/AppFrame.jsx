export default function AppFrame({ children }) {
  return (
    <div className="h-dvh overflow-hidden bg-paper text-ink">
      <div className="mx-auto flex h-full min-h-0 w-full flex-col overflow-hidden bg-card pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] desktop-card:my-6 desktop-card:h-[calc(100dvh-3rem)] desktop-card:max-w-phone desktop-card:rounded-[2rem] desktop-card:border desktop-card:border-line desktop-card:pl-0 desktop-card:pr-0 desktop-card:shadow-sm">
        {children}
      </div>
    </div>
  );
}
