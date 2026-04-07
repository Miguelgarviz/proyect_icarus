'use client'

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const PRESET_COLORS = ["#ef4444", "#3b82f6", "#eab308", "#22c55e"];

interface Player {
  id: string;
  name: string;
  color: string;
  movement: number;
}

export default function Lobby() {
  const params = useParams();
  const idLobby = params.id; // Obtenemos el ID de la URL

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados Creación
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  // Estados Edición
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  // URLs ajustadas a tu controlador
  const PLAYER_API = "http://localhost:4000/api/v1/player";
  const LOBBY_API = `http://localhost:4000/api/v1/lobby`;

  // 1. Cargar jugadores específicos de este lobby
  const fetchPlayers = async () => {
    try {
      // Usamos el nuevo endpoint que filtra por ID de lobby
      const response = await fetch(`${LOBBY_API}/players/${idLobby}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
      }
    } catch (error) {
      console.error("Error cargando jugadores del lobby:", error);
    }
  };

  useEffect(() => {
    if (idLobby) fetchPlayers();
  }, [idLobby]);

  // 2. Añadir jugador al lobby específico
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${LOBBY_API}/${idLobby}/add-player`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, movement: 3 }),
      });
      
      if (response.ok) {
        setName("");
        fetchPlayers();
      }
    } catch (error) {
      console.error("Error al añadir jugador:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Actualizar (PUT)
  const handleUpdate = async (id: string) => {
    try {
      const response = await fetch(`${PLAYER_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, color: editColor, movement: 3 }),
      });
      if (response.ok) {
        setEditingId(null);
        fetchPlayers();
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  // 4. Eliminar (DELETE)
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${PLAYER_API}/${id}`, { method: "DELETE" });
      if (response.ok) fetchPlayers();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background p-8 font-sans">
      
      {/* Formulario de Creación */}
      <div className="absolute left-8 top-8 w-72 rounded-xl border border-border p-6 shadow-sm bg-card">
        <h2 className="mb-4 text-lg font-bold text-center">Nuevo Jugador</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre"
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-foreground outline-none"
            required
          />
          
          <div className="flex justify-center gap-3">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-10 w-10 rounded-lg border-2 transition-all ${color === c ? 'scale-110 border-foreground shadow-md' : 'border-transparent opacity-70'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-full bg-foreground text-background text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Entrando..." : "Añadir al Lobby"}
          </button>
        </form>
      </div>

      {/* Lista de Jugadores */}
      <div className="flex flex-col items-center pt-20">
        <h1 className="text-4xl font-bold mb-2">Lobby</h1>
        <p className="text-muted-foreground mb-10 text-sm">Esperando a los demás jugadores...</p>
        
        <div className="w-full max-w-2xl space-y-3">
          {players.length === 0 ? (
            <div className="text-center p-10 border-2 border-dashed rounded-xl text-muted-foreground">
              No hay jugadores todavía
            </div>
          ) : (
            players.map((player) => (
              <div key={player.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
                {editingId === player.id ? (
                  <div className="flex w-full flex-col gap-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 rounded-md border px-3 py-1 text-sm bg-background"
                      />
                      <button onClick={() => handleUpdate(player.id)} className="bg-green-600 text-white px-4 py-1 rounded-md text-xs font-bold">OK</button>
                      <button onClick={() => setEditingId(null)} className="px-2 text-xs">X</button>
                    </div>
                    <div className="flex gap-2">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setEditColor(c)}
                          className={`h-6 w-6 rounded border ${editColor === c ? 'border-black scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-lg border shadow-sm" style={{ backgroundColor: player.color }} />
                      <span className="font-bold text-lg tracking-tight">{player.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setEditingId(player.id); setEditName(player.name); setEditColor(player.color); }} 
                        className="px-3 py-1.5 text-xs font-medium border rounded-md hover:bg-muted transition-colors"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(player.id)} 
                        className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}