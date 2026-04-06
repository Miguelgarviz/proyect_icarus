'use client'

import { useState } from "react";
import { PlayerDTO } from "../../dto/playerDTO";

export default function Lobby() {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#000000");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const playerData = { name, color, movement: 3 };

    try {
      const response = await fetch("http://localhost:4000/api/v1/player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playerData),
      });

      if (response.ok) {
        console.log("Jugador añadido con éxito");
        setName(""); // Limpiar formulario
      } else {
        console.error("Error al añadir jugador", response.statusText);
      }
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background p-8">
      {/* Formulario en la esquina superior izquierda */}
      <div className="absolute left-8 top-8 w-64 rounded-xl border border-border p-6 shadow-sm bg-card">
        <h2 className="mb-4 text-lg font-bold">Nuevo Jugador</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Player 1"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-10 cursor-pointer overflow-hidden rounded-md border-none bg-transparent"
              />
              <span className="text-xs font-mono uppercase">{color}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            {loading ? "Añadiendo..." : "Añadir jugador"}
          </button>
        </form>
      </div>

      {/* Contenedor central para la lista de jugadores */}
      <div className="flex flex-col items-center justify-center pt-20">
        <h1 className="text-4xl font-bold tracking-tight">Lobby</h1>
        <div className="mt-10 flex h-64 w-full max-w-2xl items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/50">
          <p className="text-muted-foreground">Aquí aparecerá la lista de jugadores...</p>
        </div>
      </div>
    </div>
  );
}