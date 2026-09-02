'use client'

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Root() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#030712] font-sans p-6 overflow-hidden">

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-blue-600/10 blur-[130px] mix-blend-screen animate-pulse" style={{ animationDuration: '9s' }} />
        <div className="absolute -bottom-40 -right-40 w-[800px] h-[800px] rounded-full bg-cyan-500/10 blur-[160px] mix-blend-screen animate-pulse" style={{ animationDuration: '14s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-xl">

        <div className="relative w-full aspect-[5/1] group transition-transform duration-700 hover:scale-[1.02]">
          <div className="absolute inset-x-4 inset-y-0 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-transparent blur-2xl group-hover:opacity-70 transition duration-1000" />
          <Image
            src="/images/Logo_Project_Icarus.png"
            alt="Project Icarus Logo"
            fill
            priority
            className="object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]"
            sizes="(max-width: 3000px) 1000vw, 1576px"
          />
        </div>

        <main className="flex flex-col items-center gap-8 text-center w-full max-w-sm px-6 py-10 rounded-xl border border-zinc-800/60 bg-black/50 backdrop-blur-lg shadow-2xl shadow-black/90">

          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-widest bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              Sala de Control
            </h1>
            <p className="text-zinc-400 text-xs max-w-xs mx-auto leading-relaxed">
              Inicializa un nuevo puente cuántico y asegura las comunicaciones antes de saltar al sector Ícaro.
            </p>
          </div>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={() => router.push("/login")}
              className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-cyan-500 bg-cyan-950/20 font-bold uppercase tracking-wider text-cyan-400 transition-all duration-300 hover:bg-cyan-500 hover:text-black active:scale-95"
              style={{ boxShadow: 'inset 0 0 12px rgba(6, 182, 212, 0.15)' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)]" />
              <span className="relative z-10 text-xs tracking-widest transition-transform duration-300 group-hover:scale-105">
                Iniciar Sesión
              </span>
              <div className="absolute top-0 left-2 right-2 h-[1px] bg-cyan-400/30 group-hover:bg-black/40" />
              <div className="absolute bottom-0 left-2 right-2 h-[1px] bg-cyan-400/30 group-hover:bg-black/40" />
            </button>

            <button
              onClick={() => router.push("/register")}
              className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-zinc-700 bg-zinc-900/50 font-bold uppercase tracking-wider text-zinc-400 transition-all duration-300 hover:border-zinc-500 hover:text-zinc-200 active:scale-95"
            >
              <span className="relative z-10 text-xs tracking-widest transition-transform duration-300 group-hover:scale-105">
                Crear Cuenta
              </span>
            </button>
          </div>

          <div className="text-[9px] uppercase font-mono tracking-widest text-zinc-600 select-none">
            Sector Link: Online // v1.0.0
          </div>
        </main>

      </div>
    </div>
  );
}