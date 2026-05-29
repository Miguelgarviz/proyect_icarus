// apps/frontend/app/game/BoardGrid.tsx
"use client";

import {
  greenPlanetNodes,
  redPlanetNodes,
  yellowPlanetNodes,
  initialNodes,
  stationNodes,
  novaTracks,
  TileMap,
  TrackMap,
  voidNodes,
} from "./mapData";
import styles from "./game.module.css";

interface BoardGridProps {
  currentRound: number;
  onNodeClick: (nodeId: string) => void; // Callback para avisar al page.tsx
}

export default function BoardGrid({
  currentRound,
  onNodeClick,
}: BoardGridProps) {
  const renderTiles = (tileList: TileMap[]) => {
    return tileList.map((node) => (
      <ellipse
        key={node.id}
        cx={node.cx}
        cy={node.cy}
        rx={node.rx}
        ry={node.ry}
        type={node.type}
        className={styles.interactable}
        onClick={() => onNodeClick(node.id)}
      />
    ));
  };

  const renderTracks = (trackList: TrackMap[]) => {
    return trackList.map((rect) => {
      const trackRoundNumber = parseInt(rect.id.replace("track_", ""), 10);

      // Comprobamos si esta casilla coincide exactamente con la ronda actual del backend
      const isActive = trackRoundNumber === currentRound;

      return (
        <rect
          key={rect.id}
          x={rect.x}
          y={rect.y}
          width={rect.w}
          height={rect.h}
          rx={4} // Añadimos bordes redondeados sutiles para que calce mejor con el diseño
          ry={4}
          // Si está activa, le mete la clase novaTrackActive, si no, se queda con la interactable normal
          className={`${styles.interactable} ${isActive ? styles.novaTrackActive : ""}`}
        />
      );
    });
  };

  return (
    <svg
      viewBox="0 0 1790 1787"
      className={styles.svgOverlay}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Renderizamos los planetas dinámicamente */}
      {renderTiles(greenPlanetNodes)}
      {renderTiles(redPlanetNodes)}
      {renderTiles(yellowPlanetNodes)}
      {renderTiles(initialNodes)}
      {renderTiles(stationNodes)}
      {renderTiles(voidNodes)}

      {/* Renderizamos el track de puntuación */}
      {renderTracks(novaTracks)}
    </svg>
  );
}
