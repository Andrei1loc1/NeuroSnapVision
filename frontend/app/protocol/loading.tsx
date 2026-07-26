export default function ProtocolLoading() {
  return (
    <div className="pt-14 space-y-4 pb-14">
      <div className="mx-6 mt-4 flex items-center justify-between">
        <div className="h-6 w-36 rounded-lg bg-white/40 animate-pulse" />
        <div className="h-8 w-16 rounded-full bg-emerald-100 animate-pulse" />
      </div>
      <div className="mx-6 mt-2 rounded-[28px] border border-white bg-white/20 p-5 h-64 animate-pulse" />
    </div>
  );
}