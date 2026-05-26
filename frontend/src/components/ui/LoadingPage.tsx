export function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="page-spinner" />
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );
}
