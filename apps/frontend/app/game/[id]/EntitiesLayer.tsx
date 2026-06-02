import { PlayerChipDTO } from "../../../lib/dto/playerDTO";
import { nodeCoordinates } from "./mapData";

export const PLAYER_IMAGES: Record<string, string> = {
  "#ef4444": "/images/jugador_rojo.png",
  "#3b82f6": "/images/jugador_azul.png",
  "#22c55e": "/images/jugador_verde.png",
  "#eab308": "/images/jugador_naranja.png",
};

export default function EntitiesLayer({
  playersData,
}: {
  playersData: PlayerChipDTO[];
}) {
  return (
    <g>
      {playersData.map((player) => {
        const coords = nodeCoordinates[player.externalId];
        if (!coords || coords.cx === undefined) return null;

        const imageSize = 150; 

        return (
          <g key={player.id} style={{ transition: "all 0.5s ease" }}>
            <image
              href={PLAYER_IMAGES[player.color]}
              x={coords.cx - imageSize / 2} 
              y={coords.cy - imageSize / 2}
              width={imageSize}
              height={imageSize}
              style={{ cursor: "pointer" }}
            />
          </g>
        );
      })}
    </g>
  );
}
