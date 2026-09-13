"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="max-w-md text-sm text-gray-500">
          The page hit a temporary glitch. Your copied color is safe — just try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
