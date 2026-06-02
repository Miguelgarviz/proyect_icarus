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
  onNodeClick: (id: string) => void;
  currentRound: number;
  allowedNodes: string[]; 
}

export default function BoardGrid({
  onNodeClick,
  currentRound,
  allowedNodes,
}: BoardGridProps) {
  const renderTiles = (tileList: TileMap[]) => {
    return tileList.map((node) => {
      const isAllowed = allowedNodes.includes(node.id);

      return (
        <ellipse
          key={node.id}
          cx={node.cx}
          cy={node.cy}
          rx={node.rx}
          ry={node.ry}
          className={`${styles.interactable} ${isAllowed ? styles.nodeHighlighted : ""}`}
          onClick={() => onNodeClick(node.id)}
        />
      );
    });
  };

  const renderTracks = (trackList: TrackMap[]) => {
  return trackList.map((rect) => {
    const trackRoundNumber = parseInt(rect.id.replace('track_', ''), 10);
    const isActive = trackRoundNumber === currentRound;

    return (
      <rect
        key={rect.id}
        x={rect.x}
        y={rect.y}
        width={rect.w}
        height={rect.h}
        rx={4}
        ry={4}
        className={isActive ? styles.novaTrackActive : styles.novaTrackStatic}
      />
    );
  });
};

  return (
    <>
      {renderTiles(greenPlanetNodes)}
      {renderTiles(redPlanetNodes)}
      {renderTiles(yellowPlanetNodes)}
      {renderTiles(initialNodes)}
      {renderTiles(stationNodes)}
      {renderTiles(voidNodes)}
      
      {renderTracks(novaTracks)}
    </>
  );
}
