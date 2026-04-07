'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreateLobby = async () => {
    setLoading(true);
    try {
      // Llamada al endpoint que crea el lobby
      const response = await fetch("http://localhost:4000/api/v1/lobby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dificulty: "BEGINNER_I", numPlayers: 0 }),
      });

      if (response.ok) {
        const lobby = await response.json();
        // Redirigimos al lobby usando el ID que nos da el servidor (ej: lobby.id)
        router.push(`/lobby/${lobby.id}`);
      } else {
        console.error("Error al crear el lobby");
      }
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-8">
      <main className="flex flex-col items-center gap-12 text-center">
        <Image
          className="dark:invert opacity-80"
          src="/next.svg"
          alt="Next.js logo"
          width={120}
          height={24}
          priority
        />
        
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tighter text-black dark:text-zinc-50">
            Game Room
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            Crea una partida nueva y espera a tus amigos.
          </p>
        </div>

        <button
          onClick={handleCreateLobby}
          disabled={loading}
          className="group relative flex h-16 w-64 items-center justify-center overflow-hidden rounded-full bg-black text-white text-xl font-bold transition-all hover:scale-105 active:scale-95 dark:bg-white dark:text-black disabled:opacity-50"
        >
          <span>{loading ? "Creando..." : "Crear Lobby"}</span>
          {!loading && (
            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
              <div className="relative h-full w-8 bg-white/20 dark:bg-black/10" />
            </div>
          )}
        </button>
      </main>
    </div>
  );
}