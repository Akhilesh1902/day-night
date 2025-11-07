import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1>Hello</h1>
      <Link
        href="/model"
        className="p-3 bg-white text-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all mt-5 border border-slate-300 hover:bg-blue-400">
        Go to 3D Model
      </Link>
    </div>
  );
}
