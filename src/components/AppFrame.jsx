export default function AppFrame({ children }) {
  return (
    <div className="h-dvh overflow-hidden bg-paper text-ink">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-phone flex-col overflow-hidden bg-card sm:my-6 sm:h-[calc(100dvh-3rem)] sm:rounded-[2rem] sm:border sm:border-line sm:shadow-sm">
        {children}
      </div>
    </div>
  );
}
