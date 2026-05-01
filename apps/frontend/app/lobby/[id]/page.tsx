'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const PRESET_COLORS = ["#ef4444", "#3b82f6", "#eab308", "#22c55e"];

interface Player {
  id: string;
  name: string;
  color: string;
  movement: number;
}

interface Lobby {
  id: string;
  dificulty: string;
  numPlayers: number;
}

enum Difficulty {
    beginner_i = "BEGINNER_I",
    beginner_ii= "BEGINNER_II",
    easy_i = "EASY_I",
    easy_ii = "EASY_II",
    medium_i = "MEDIUM_I",
    medium_ii = "MEDIUM_II",
    hard_i = "HARD_I",
    hard_ii = "HARD_II",
    extreme_i = "EXTREME_I",
    extreme_ii = "EXTREME_II",
    impossible = "IMPOSSIBLE",
}

const difficultyToDisplayName: Record<Difficulty, string> = {
    [Difficulty.beginner_i]: "Beginner I",
    [Difficulty.beginner_ii]: "Beginner II",
    [Difficulty.easy_i]: "Easy I",
    [Difficulty.easy_ii]: "Easy II",
    [Difficulty.medium_i]: "Medium I",
    [Difficulty.medium_ii]: "Medium II",
    [Difficulty.hard_i]: "Hard I",
    [Difficulty.hard_ii]: "Hard II",
    [Difficulty.extreme_i]: "Extreme I",
    [Difficulty.extreme_ii]: "Extreme II",
    [Difficulty.impossible]: "Impossible",  
};

export default function Lobby() {
  const params = useParams();
  const router = useRouter();
  const idLobby = params.id; // Obtenemos el ID de la URL

  const [players, setPlayers] = useState<Player[]>([]); 
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estados Creación
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  // Estados Edición
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.beginner_i);

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

  const fetchLobby = async () => {
    try {
      const response = await fetch(`${LOBBY_API}/${idLobby}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) {
        const data = await response.json();
        setLobby(data);
      }
    } catch (error) {
      console.error("Error cargando datos del lobby:", error);
    }
  };

  useEffect(() => {
    if (idLobby) {
      fetchPlayers();
      fetchLobby();
    }
  }, [idLobby, players]);

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

  const handleDifficultyChange = async (newDifficulty: Difficulty) => {
    try {
      await fetch(`${LOBBY_API}/${idLobby}/difficulty`, {
        method: "PUT", // O PUT, según tu controlador
        headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficulty: newDifficulty }), 
      });
      setDifficulty(newDifficulty);
    } catch (error) {
      console.error("Error al actualizar dificultad:", error);
    }
  };

  const handleStartGame = async()=>{
    try{
      const response = await fetch(`http://localhost:4000/api/v1/game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lobby: idLobby , actualPlayerId: players[0].id }),
      });
      if (response.ok) {
        const game = await response.json();
        await fetch(`http://localhost:4000/api/v1/store`,{
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({gameId: game.id}),
        })
        router.push(`/game/${game.id}`);
      } else {
        console.error("Error al crear el game");
      }
    }catch(error){
      console.error("Error de red:", error);
    }
  }

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
      const response = await fetch(`${LOBBY_API}/${id}/remove-player`, { method: "PUT" });
      if (response.ok) fetchPlayers();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
  <div className="relative min-h-screen w-full bg-background p-8 font-sans">
    
    <div className="flex justify-end gap-4 mb-8 ml-80"> 
      <div className="bg-card border border-border p-4 rounded-xl shadow-sm min-w-[200px]">
        <h3 className="text-sm font-bold mb-2">Dificultad del Juego</h3>
        <select 
          value={difficulty} 
          onChange={(e) => handleDifficultyChange(e.target.value as Difficulty)}
          className="w-full rounded-md border border-input bg-white px-3 py-1 text-black outline-none focus:ring-2 focus:ring-foreground"
        >
          {Object.values(Difficulty).map((value) => (
          <option key={value} value={value}>
            {difficultyToDisplayName[value]}
          </option>
          ))}
        </select>
      </div>

      <div className="bg-card border border-border p-4 rounded-xl shadow-sm min-w-[150px] flex flex-col items-center justify-center">
        <h3 className="text-sm font-bold mb-1">Estado del Lobby</h3>
        <div className="text-2xl font-black text-foreground">
          {lobby?.numPlayers || 0} / 4
        </div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Jugadores listos</p>
      </div>
    </div>

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
    <div className="flex flex-col items-center pt-10">
       {/* ... resto de la lista igual ... */}
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
               {/* ... contenido del player igual ... */}
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
    {players.length >= 1 && (
      <div className="flex justify-center pb-20 mt-12">
        <button
          onClick={handleStartGame}
          className="group relative inline-flex items-center justify-center px-12 py-4 font-bold text-white transition-all duration-200 bg-green-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 hover:bg-green-700 shadow-xl hover:scale-105 active:scale-95"
        >
          START GAME
          <svg 
            className="w-5 h-5 ml-2 -mr-1 transition-all duration-200 group-hover:translate-x-1" 
            fill="currentColor" 
            viewBox="0 0 20 20" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
        </button>
      </div>)}
  </div>
);
}