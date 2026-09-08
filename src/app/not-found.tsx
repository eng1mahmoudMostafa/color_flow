import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="flex h-16 w-16 overflow-hidden rounded-2xl ring-1 ring-line">
        <span className="h-full w-1/5 bg-[#0F172A]" />
        <span className="h-full w-1/5 bg-[#3B82F6]" />
        <span className="h-full w-1/5 bg-[#8B5CF6]" />
        <span className="h-full w-1/5 bg-[#52B788]" />
        <span className="h-full w-1/5 bg-[#F7C548]" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 text-sm text-ink-soft">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
      >
        Back to home
      </Link>
    </div>
  );
}
