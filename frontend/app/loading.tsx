export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin" />
      </div>
    </div>
  );
}