'use client'

import { getTokenPayload, getToken } from "../../lib/auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [lobbyCode, setLobbyCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    const payload = getTokenPayload();
    if (!payload) {
      router.push("/login");
      return;
    }

    try {
      setUsername(payload.username);
      setUserId(payload.sub);
    } catch {
      router.push("/login");
    }
  }, [router]);

  const handleCreateLobby = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch("http://localhost:4000/api/v1/lobby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ hostId: userId }),
      });

      if (response.ok) {
        const lobby = await response.json();

        const response2 = await fetch(`http://localhost:4000/api/v1/lobby/${lobby.id}/add-player`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: userId }),
        });

        if (!response2.ok) {
          console.error("Error al agregar el jugador al lobby: ", response2.statusText);
          return;
        }
        router.push(`/lobby/${lobby.id}`);
      } else {
        console.error("Error al crear el lobby: ", response.statusText);
      }
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinLoading(true);
    setJoinError(null);

    try {
      const token = getToken();

      console.log("token", token)
      console.log("intentamos", lobbyCode, userId)
      const response = await fetch(`http://localhost:4000/api/v1/lobby/join`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ code: lobbyCode, userId: userId })
      });

      if (response.ok) {
        const lobby = await response.json();
        router.push(`/lobby/${lobby.id}`);
      } else if (response.status === 404) {
        setJoinError("CÓDIGO DE PARTIDA NO ENCONTRADO");
      } else {
        setJoinError(`ERROR AL UNIRSE AL LOBBY: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error de red:", error);
      setJoinError("NO SE PUDO ESTABLECER CONTACTO CON EL SERVIDOR");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/");
  };

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

          {/* User info */}
          <div className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <div className="text-left">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                  Piloto identificado
                </p>
                <p className="text-sm font-black tracking-widest text-white uppercase">
                  {username ?? "..."}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="shrink-0 h-8 px-3 rounded border border-red-900/40 bg-red-950/30 text-[10px] font-bold uppercase tracking-widest text-red-400 transition-colors hover:bg-red-900 hover:text-white"
            >
              Cerrar Sesión
            </button>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-widest bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              Sala de Control
            </h1>
            <p className="text-zinc-400 text-xs max-w-xs mx-auto leading-relaxed">
              Inicializa un nuevo puente cuántico o sincroniza con una frecuencia existente.
            </p>
          </div>

          {/* Crear lobby */}
          <button
            onClick={handleCreateLobby}
            disabled={loading}
            className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-cyan-500 bg-cyan-950/20 font-bold uppercase tracking-wider text-cyan-400 transition-all duration-300 hover:bg-cyan-500 hover:text-black active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            style={{ boxShadow: 'inset 0 0 12px rgba(6, 182, 212, 0.15)' }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)]" />
            <span className="relative z-10 text-xs tracking-widest transition-transform duration-300 group-hover:scale-105">
              {loading ? "Estableciendo nexo..." : "Crear Vestíbulo"}
            </span>
            <div className="absolute top-0 left-2 right-2 h-[1px] bg-cyan-400/30 group-hover:bg-black/40" />
            <div className="absolute bottom-0 left-2 right-2 h-[1px] bg-cyan-400/30 group-hover:bg-black/40" />
          </button>

          {/* Separador */}
          <div className="flex w-full items-center gap-3">
            <div className="flex-1 h-[1px] bg-zinc-800" />
            <span className="text-[10px] text-zinc-600 uppercase tracking-widest">o</span>
            <div className="flex-1 h-[1px] bg-zinc-800" />
          </div>

          {/* Unirse a un lobby */}
          <form onSubmit={handleJoinLobby} className="flex flex-col gap-3 w-full">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest text-left">
                Código de Partida:
              </span>
              <input
                type="text"
                value={lobbyCode}
                onChange={(e) => {
                  setLobbyCode(e.target.value.toUpperCase());
                  setJoinError(null);
                }}
                placeholder="XXXXXXXX"
                maxLength={8}
                className="w-full rounded border border-zinc-800 bg-black px-3 py-2 text-xs font-mono tracking-[0.3em] text-center text-zinc-200 placeholder-zinc-700 outline-none transition-colors focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 uppercase"
              />
            </div>

            {joinError && (
              <div className="rounded border border-red-500/30 bg-red-950/20 px-3 py-2">
                <p className="text-[10px] text-red-400 font-bold tracking-tight">
                  ⚠️ {joinError}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={joinLoading || lobbyCode.trim().length === 0}
              className="h-10 w-full rounded border border-zinc-700 bg-zinc-900/50 text-xs font-bold uppercase tracking-widest text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-20 disabled:pointer-events-none"
            >
              {joinLoading ? "Sincronizando..." : "Unirse al Vestíbulo"}
            </button>
          </form>

          <div className="text-[9px] uppercase font-mono tracking-widest text-zinc-600 select-none">
            Sector Link: Online // v1.0.0
          </div>
        </main>

      </div>
    </div>
  );
}