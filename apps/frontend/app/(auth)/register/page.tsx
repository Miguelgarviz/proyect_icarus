"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AUTH_API = "http://localhost:4000/api/v1/auth";

export default function Register() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Registramos al usuario
      const registerResponse = await fetch(`${AUTH_API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!registerResponse.ok) {
        if (registerResponse.status === 409) {
          setError("IDENTIFICADOR YA REGISTRADO EN EL SISTEMA");
        } else {
          setError("ERROR AL CREAR EL REGISTRO");
        }
        return;
      }

      // Login automático tras el registro
      const loginResponse = await fetch(`${AUTH_API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (loginResponse.ok) {
        const data = await loginResponse.json();
        localStorage.setItem("access_token", data.access_token);
        router.push(`/home`);
      } else {
        // El registro fue bien pero el login falló — redirigimos al login
        router.push("/login");
      }
    } catch {
      setError("NO SE PUDO ESTABLECER CONTACTO CON EL SERVIDOR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030712] font-mono text-zinc-300 flex items-center justify-center overflow-hidden selection:bg-cyan-500 selection:text-black">

      {/* Grid background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm px-6">

        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-[10px] tracking-widest text-cyan-500 uppercase mb-3">
            — Project Icarus —
          </p>
          <h1 className="text-3xl font-black tracking-widest text-white uppercase">
            <span className="text-cyan-500">&gt;</span> Registro
          </h1>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-2">
            Crear nuevo perfil de piloto
          </p>
        </div>

        {/* Form */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 backdrop-blur-md p-6 shadow-xl">

          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-xs font-black tracking-widest text-cyan-400 uppercase">
              Nuevo Piloto
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                Nombre de Usuario:
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="INGRESAR IDENTIFICADOR..."
                className="w-full rounded border border-zinc-800 bg-black px-3 py-2 text-xs font-mono tracking-wide text-zinc-200 placeholder-zinc-700 outline-none transition-colors focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                required
                autoComplete="username"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                Código de Acceso:
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded border border-zinc-800 bg-black px-3 py-2 text-xs font-mono tracking-wide text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                required
                autoComplete="new-password"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded border border-red-500/30 bg-red-950/20 px-3 py-2">
                <p className="text-[10px] text-red-400 font-bold tracking-tight">
                  ⚠️ {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username.trim() || !password.trim()}
              className="h-10 w-full rounded border border-cyan-500 bg-cyan-950/20 text-xs font-bold uppercase tracking-widest text-cyan-400 transition-colors hover:bg-cyan-500 hover:text-black disabled:opacity-20 disabled:pointer-events-none"
            >
              {loading ? "Registrando..." : "Crear Cuenta"}
            </button>

          </form>
        </div>

        {/* Login link */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
            ¿Ya tienes acceso al sistema?{" "}
            <Link
              href="/login"
              className="text-cyan-500 hover:text-cyan-400 transition-colors"
            >
              Identificarse
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}