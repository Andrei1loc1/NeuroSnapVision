import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-8 flex items-center gap-2">
        <Image
          src="/images/leaf.png"
          alt="NeuroSnap"
          width={36}
          height={36}
          className="drop-shadow-sm"
          priority
        />
        <span className="text-lg font-semibold tracking-tight text-emerald-700">
          NeuroSnap
        </span>
      </div>

      <h1 className="bg-gradient-to-br from-emerald-600 to-teal-500 bg-clip-text text-7xl font-bold tracking-tight text-transparent">
        404
      </h1>

      <h2 className="mt-4 text-xl font-semibold text-gray-800">
        Pagina nu a fost găsită
      </h2>

      <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-500">
        Pagina pe care o cauți nu există sau a fost mutată.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-700 active:bg-emerald-800"
      >
        Înapoi acasă
      </Link>
    </div>
  );
}