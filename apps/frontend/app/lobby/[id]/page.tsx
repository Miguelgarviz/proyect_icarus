'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import LobbyForm from './LobbyForm';

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

const difficultyImages: Record<string, string> = {
    "beginner_i": "/images/goals/Beginner_i.png",
    "beginner_ii": "/images/goals/Beginner_ii.png",
    "easy_i": "/images/goals/Easy_i.png",
    "easy_ii": "/images/goals/Easy_ii.png",
    "medium_i": "/images/goals/Medium_i.png",
    "medium_ii": "/images/goals/Medium_ii.png",
    "hard_i": "/images/goals/Hard_i.png",
    "hard_ii": "/images/goals/Hard_ii.png",
    "extreme_i": "/images/goals/Extreme_i.png",
    "extreme_ii": "/images/goals/Extreme_ii.png",
    "impossible": "/images/goals/Impossible_i.png",  
};

export default function Lobby() {
  const params = useParams();
  const router = useRouter();
  const idLobby = params.id;

  const [players, setPlayers] = useState<Player[]>([]); 
  const [joined, setJoined] = useState(false);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [color, setColor] = useState<string|null>(PRESET_COLORS[0]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.beginner_i);

  const PLAYER_API = "http://localhost:4000/api/v1/player";
  const LOBBY_API = `http://localhost:4000/api/v1/lobby`;

  const fetchPlayers = async () => {
    try {
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
        setColor(null);
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
        method: "PUT",
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
        await fetch(`http://localhost:4000/api/v1/game/${game.id}/create-store`,{
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
        await fetch(`http://localhost:4000/api/v1/drill-card`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({gameId: game.id}),
        })
        await fetch(`http://localhost:4000/api/v1/player/${lobby?.id}/ship`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        })
        await fetch(`http://localhost:4000/api/v1/player/${lobby?.id}/storage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        })
        await fetch(`http://localhost:4000/api/v1/tile/${game.id}/game`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
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
        setColor(null);
        fetchPlayers();
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${LOBBY_API}/${id}/remove-player`, { method: "PUT" });
      if (response.ok) fetchPlayers();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
  <div className="relative min-h-screen w-full bg-[#030712] p-8 font-mono text-zinc-300 overflow-x-hidden selection:bg-cyan-500 selection:text-black">
    
    {/* Rejilla de fondo sutil tipo radar */}
    <div className="absolute inset-0 z-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />

    {/* SECCIÓN CONFIGURACIÓN SUPERIOR */}
    <div className="relative z-10 flex flex-wrap justify-end gap-4 mb-12 max-w-5xl mx-auto"> 
      {/* Selector de Dificultad */}
      <div className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.05)] min-w-[220px]">
        <h3 className="text-xs font-bold tracking-widest text-cyan-400 uppercase mb-2">// Nivel de Dificultad</h3>
        <select 
          value={difficulty} 
          onChange={(e) => handleDifficultyChange(e.target.value as Difficulty)}
          className="w-full rounded border border-cyan-500/40 bg-zinc-950 px-3 py-1.5 text-xs text-cyan-300 font-mono outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 cursor-pointer"
        >
          {Object.values(Difficulty).map((value) => (
            <option key={value} value={value} className="bg-zinc-950 text-zinc-300">
              {difficultyToDisplayName[value].toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Contador de Estado */}
      <div className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.05)] min-w-[180px] flex flex-col items-center justify-center text-center">
        <h3 className="text-xs font-bold tracking-widest text-cyan-400 uppercase mb-1">// Número de Naves</h3>
        <div className="text-3xl font-black text-white tracking-wider animate-pulse">
          {lobby?.numPlayers || 0}<span className="text-zinc-600">/</span>4
        </div>
        <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mt-1">Naves Listas</p>
      </div>
    </div>

    {/* CONTENEDOR CENTRAL DE INTERFAZ TRIPLE COLUMNA */}
    <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr_240px] gap-8 items-start">
      
      {/* PANEL IZQUIERDO: NUEVO JUGADOR */}
      {(lobby && lobby.numPlayers < 4) ? (
        <div className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 backdrop-blur-md p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-xs font-black tracking-widest text-cyan-400 uppercase">Añadir Piloto</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="INGRESAR NOMBRE..."
                className={`w-full rounded border bg-black px-3 py-2 text-xs font-mono tracking-wide placeholder-zinc-700 outline-none transition-colors focus:ring-1 ${
                  players.some(p => p.name.toLowerCase() === name.trim().toLowerCase()) 
                    ? 'border-red-500 text-red-400 focus:ring-red-500' 
                    : 'border-zinc-800 text-zinc-200 focus:border-cyan-500 focus:ring-cyan-500'
                }`}
                required
              />
              {players.some(p => p.name.toLowerCase() === name.trim().toLowerCase()) && (
                <p className="text-[10px] text-red-400 mt-1 font-bold tracking-tight">⚠️ REGISTRO DUPLICADO EN EL LOBBY</p>
              )}
            </div>
            
            {/* Selector de Colores Frecuencia */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">Asignar Color:</span>
              <div className="flex justify-between gap-2">
                {PRESET_COLORS.map((c) => {
                  const isColorTaken = players.some(p => p.color === c);
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={isColorTaken}
                      onClick={() => setColor(c)}
                      className={`h-8 flex-1 rounded border transition-all relative ${
                        color === c 
                          ? 'border-white scale-105 shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                          : 'border-zinc-900 opacity-60'
                      } ${
                        isColorTaken ? 'opacity-10 grayscale cursor-not-allowed border-transparent' : 'hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                      title={isColorTaken ? "Frecuencia Bloqueada" : "Frecuencia Disponible"}
                    >
                      {isColorTaken && <span className="absolute inset-0 flex items-center justify-center text-[10px] text-black font-bold">X</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={
                loading || 
                !name.trim() || 
                !color || 
                players.some(p => p.name.toLowerCase() === name.trim().toLowerCase())
              }
              className="h-10 w-full rounded border border-cyan-500 bg-cyan-950/20 text-xs font-bold uppercase tracking-widest text-cyan-400 transition-colors hover:bg-cyan-500 hover:text-black disabled:opacity-20 disabled:pointer-events-none"
            >
              {loading ? "Sincronizando..." : "Añadir al lobby"}
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full rounded-lg border border-red-500/30 bg-red-950/10 p-6 text-center text-xs tracking-widest text-red-400 font-bold uppercase">
          ⚠️ Capacidad Máxima de Naves Alcanzada
        </div>
      )}

      {/* PANEL CENTRAL: CONSOLA LOBBY & JUGADORES */}
      <div className="w-full bg-zinc-950/40 border border-zinc-950 rounded-lg p-2">
         <div className="text-center md:text-left mb-8 px-4">
            <h1 className="text-3xl font-black tracking-widest text-white uppercase flex items-center justify-center md:justify-start gap-3">
              <span className="text-cyan-500">&gt;</span> Lobby
            </h1>
         </div>
         
         <div className="space-y-3">
           {players.length === 0 ? (
             <div className="text-center p-12 border border-dashed border-zinc-800 rounded-lg text-zinc-600 text-xs uppercase tracking-widest">
               [ No hay naves detectadas ]
             </div>
           ) : (
             players.map((player) => (
               <div 
                 key={player.id} 
                 className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-zinc-800 bg-black/60 p-4 shadow-md gap-4 transition-all hover:border-zinc-700"
               >
                 {editingId === player.id ? (
                    <div className="flex w-full flex-col gap-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 rounded border border-zinc-700 px-3 py-1.5 text-xs bg-black text-white font-mono outline-none focus:border-cyan-500"
                        />
                        <button 
                          onClick={() => handleUpdate(player.id)} 
                          className="bg-emerald-600 text-white px-4 py-1 rounded text-xs font-bold uppercase tracking-wider hover:bg-emerald-700"
                        >
                          Confirmar
                        </button>
                        <button 
                          onClick={() => setEditingId(null)} 
                          className="px-3 border border-zinc-700 rounded text-xs hover:bg-zinc-900"
                        >
                          Anular
                        </button>
                      </div>
                      <div className="flex gap-2">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => setEditColor(c)}
                            className={`h-5 flex-1 rounded border ${editColor === c ? 'border-white scale-105' : 'border-transparent opacity-60'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="h-6 w-6 rounded border border-black/40 shadow-inner relative flex items-center justify-center shrink-0" style={{ backgroundColor: player.color }}>
                          <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-ping" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-base tracking-wide text-zinc-100 uppercase">{player.name}</span>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Estatus: Nave lista</span>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => { setEditingId(player.id); setEditName(player.name); setEditColor(player.color); }} 
                          className="px-3 py-1 text-[11px] font-bold uppercase tracking-widest border border-zinc-700 rounded text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
                        >
                          Modificar
                        </button>
                        <button 
                          onClick={() => handleDelete(player.id)} 
                          className="px-3 py-1 text-[11px] font-bold uppercase tracking-widest bg-red-950/30 border border-red-900/40 text-red-400 rounded hover:bg-red-900 hover:text-white transition-colors"
                        >
                          Expulsar
                        </button>
                      </div>
                    </>
                  )}
               </div>
             ))
           )}
         </div>
      </div>

      {/* 🖼️ PANEL DERECHO: EXCLUSIVAMENTE LA IMAGEN REACTIVA */}
      <div className="w-full aspect-square md:aspect-[3/4] rounded-lg border border-cyan-500/20 bg-zinc-950/50 backdrop-blur-md p-3 shadow-xl flex items-center justify-center relative overflow-hidden group">
        {/* Efecto HUD: Barrido de escaneo láser */}
        <div className="absolute inset-x-0 h-[1.5px] bg-cyan-400/20 top-0 animate-[bounce_4s_infinite] pointer-events-none z-10" />
        
        <div className="relative w-full h-full min-h-[200px]">
          <Image 
            src={difficultyImages[difficulty.toString().toLocaleLowerCase()]} 
            alt={`Dificultad ${difficulty}`}
            fill
            className="object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            priority
          />
        </div>
      </div>

    </div>

    {/* BOTÓN DE IGNICIÓN CENTRAL DE ABAJO */}
    {players.length >= 1 && (
      <div className="flex flex-col items-center justify-center pb-20 mt-16 relative z-10">
        <button
          onClick={handleStartGame}
          className="group relative inline-flex items-center justify-center px-16 py-4 font-mono font-black tracking-widest text-black transition-all duration-300 bg-cyan-400 rounded uppercase overflow-hidden hover:bg-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] active:scale-95"
        >
          <div className="absolute inset-0 w-1/2 h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[shine_1s_ease-in-out]" />
          INICIAR SALTO (START)
          <svg 
            className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" 
            fill="currentColor" 
            viewBox="0 0 20 20" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
        </button>
      </div>
    )}
  </div>
);
}