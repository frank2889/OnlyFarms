import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold">OnlyFarms</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-300">
        Vind boerderijwinkels bij jou in de buurt — verse producten direct van
        de boer.
      </p>
      <div className="flex gap-4">
        <Link
          href="/kaart"
          className="rounded-lg bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800"
        >
          Bekijk de kaart
        </Link>
        <Link
          href="/verkopen"
          className="rounded-lg border border-green-700 px-6 py-3 font-medium text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-neutral-900"
        >
          Verkopen via OnlyFarms
        </Link>
      </div>
    </main>
  );
}
