// apps/frontend/app/lobby/[id]/JoinLobbyForm.tsx
"use client";
import { useState } from 'react';

interface Player {
  name: string;
  color: string;
}

const AVAILABLE_COLORS = [
  { name: 'Rojo', value: '#ef4444' },
  { name: 'Azul', value: "#3b82f6"},
  { name: 'Verde', value: "#eab308" },
  { name: 'Amarillo', value: "#22c55e" }
];

export default function LobbyForm({ 
  existingPlayers, 
  onCreatePlayer 
}: { 
  existingPlayers: Player[], 
  onCreatePlayer: (name: string, color: string) => void 
}) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // Validaciones en tiempo real
  const isNameTaken = existingPlayers.some(
    (p) => p.name.toLowerCase() === name.trim().toLowerCase()
  );
  const takenColors = existingPlayers.map((p) => p.color);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNameTaken && selectedColor && name.trim()) {
      onCreatePlayer(name.trim(), selectedColor);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label>Nombre:</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          style={{ borderColor: isNameTaken ? 'red' : 'initial' }}
        />
        {isNameTaken && <p style={{ color: 'red' }}>Nombre ya ocupado</p>}
      </div>

      <div>
        <label>Color:</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          {AVAILABLE_COLORS.map((c) => {
            const isOccupied = takenColors.includes(c.value);
            return (
              <button
                key={c.value}
                type="button"
                disabled={!c ||isOccupied}
                onClick={() => setSelectedColor(c.value)}
                style={{
                  backgroundColor: c.value,
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  border: selectedColor === c.value ? '3px solid black' : '1px solid gray',
                  opacity: isOccupied ? 0.3 : 1
                }}
              />
            );
          })}
        </div>
      </div>

      <button type="submit" disabled={isNameTaken || !selectedColor || !name.trim()}>
        Crear y Unirse al Lobby
      </button>
    </form>
  );
}