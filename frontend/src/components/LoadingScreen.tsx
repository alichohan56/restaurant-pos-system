export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      <p className="text-sm font-medium text-slate-500">Loading RestroPOS...</p>
    </div>
  );
}
