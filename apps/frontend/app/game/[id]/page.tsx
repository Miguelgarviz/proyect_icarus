"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import BoardGrid from "./BoardGrid";
import EntitiesLayer from "./EntitiesLayer";
import styles from "./game.module.css";
import { useParams } from "next/navigation";
import { PlayerDTO, PlayerChipDTO } from "../../../lib/dto/playerDTO";
import { ShipDTO } from "../../../lib/dto/shipDTO";
import { CardDTO, StoreDTO } from "../../../lib/dto/storeDTO";
import { StorageDTO } from "../../../lib/dto/storageDTO";
import { GameDTO } from "../../../lib/dto/gameDTO";
import { TileDTO } from "../../../lib/dto/tileDTO";
import StoreComponent from "./StoreComponent";
import PlayerDataComponent from "./playerDataComponent";
import { spaceStationLandings } from "./mapData";

export default function GamePage() {
  const params = useParams();
  const [players, setPlayers] = useState<PlayerDTO[]>([]);
  const [game, setGame] = useState<GameDTO>();
  const [tiles, setTiles] = useState<TileDTO[]>([]);
  const [round, setRound] = useState<number>(0);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerDTO>();
  const [ships, setShips] = useState<ShipDTO[]>([]);
  const [playersChips, setPlayersChips] = useState<PlayerChipDTO[]>([]);
  const [storeCards, setStoreCards] = useState<CardDTO[]>([]);
  const [playerCards, setPlayerCards] = useState<CardDTO[]>([]);
  const [storages, setStorages] = useState<StorageDTO[]>([]);
  const [store, setStore] = useState<StoreDTO>();
  const [loading, setLoading] = useState<boolean>(false);
  const gameId = params.id;

  useEffect(() => {
    setLoading(true);
    fetchPlayers();
    fetchTiles();
    fetchStore();
    setLoading(false);
  }, [gameId]);

  useEffect(() => {
    if (currentPlayer && ships.length > 0) {
      const ship = ships.find((s) => s.id === currentPlayer?.shipId);
      maxDistance(
        currentPlayer,
        ship
          ? ship
          : ({ positionX: 0, positionY: 0, externalId: "" } as ShipDTO),
      );
    }
  }, [currentPlayer?.movement, playersChips]);
  const fetchPlayers = async () => {
    try {
      const playersResponse = await fetch(
        `http://localhost:4000/api/v1/game/${gameId}/players`,
      );
      if (!playersResponse.ok) throw new Error("Error al cargar jugadores");
      const playersData = await playersResponse.json();
      await setPlayers(playersData);

      const gameResponse = await fetch(
        `http://localhost:4000/api/v1/game/${gameId}`,
      );
      if (!gameResponse.ok) throw new Error("Error al cargar la partida");
      const gameData = await gameResponse.json();
      await setGame(gameData);

      await setRound(gameData.round);
      await setCurrentPlayer(
        playersData.find((p: PlayerDTO) => p.id === gameData.actualPlayerId),
      );

      const shipsResponse = await fetch(
        `http://localhost:4000/api/v1/game/${gameId}/ships`,
      );
      if (!shipsResponse.ok) throw new Error("Error al cargar naves");
      const shipsData = await shipsResponse.json();
      await setShips(shipsData);

      const storageResponse = await fetch(
        `http://localhost:4000/api/v1/game/${gameId}/storages`,
      );
      if (!storageResponse.ok)
        throw new Error("Error al cargar almacenamiento");
      const storageData = await storageResponse.json();
      await setStorages(storageData);

      const playerCardsResponse = await fetch(
        `http://localhost:4000/api/v1/card/player-cards/${gameData.actualPlayerId}`,
      );
      if (!playerCardsResponse.ok)
        throw new Error("Error al cargar las cartas del jugador");
      const playerCardsData = await playerCardsResponse.json();
      await setPlayerCards(playerCardsData);

      const newChips: PlayerChipDTO[] = [];
      for (let i = 0; i < playersData.length; i++) {
        newChips.push({
          id: playersData[i].id,
          color: playersData[i].color,
          coordX: shipsData[i].positionX,
          coordY: shipsData[i].positionY,
          externalId: shipsData[i].externalId,
        });
      }
      setPlayersChips(newChips);
    } catch (error) {
      console.error(error);
    }
  };

  function seededRandom(seed: number) {
    return function () {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const shuffleArray = (array: CardDTO[], seed: number) => {
    const shuffled = [...array];
    const random = seededRandom(seed);
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchStore = async () => {
    try {
      const storeResponse = await fetch(
        `http://localhost:4000/api/v1/game/${gameId}/store`,
      );
      if (!storeResponse.ok)
        throw new Error("Error al cargar la tienda de la partida");
      const storeData = await storeResponse.json();
      await setStore(storeData);

      const storeCardsResponse = await fetch(
        `http://localhost:4000/api/v1/store/${storeData.id}/cards`,
      );
      if (!storeCardsResponse.ok)
        throw new Error("Error al cargar las cartas de la tienda");
      const storeCardsData = await storeCardsResponse.json();

      const randomCards = shuffleArray(storeCardsData, Number(gameId));
      setStoreCards(randomCards);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTiles = async () => {
    try {
      const tilesResponse = await fetch(
        `http://localhost:4000/api/v1/tile/game/${gameId}`,
      );
      if (!tilesResponse.ok) throw new Error("Error al cargar las losetas");
      const tilesData = await tilesResponse.json();
      await setTiles(tilesData);
    } catch (error) {
      console.error(error);
    }
  };

  const nextPlayer = async () => {
    if (players.length === 0) return;
    const currentIndex = players.findIndex((p) => p.id === currentPlayer?.id);
    const nextIndex = (currentIndex + 1) % players.length;
    const ship = await ships.find((s) => s.id === players[nextIndex].shipId);
    players[nextIndex].movement = ship ? ship.engine : 0;
    setCurrentPlayer(players[nextIndex]);
    await fetch(`http://localhost:4000/api/v1/game/${gameId}/next-player`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPlayerId: players[nextIndex].id }),
    });
    await fetch(
      `http://localhost:4000/api/v1/player/${players[nextIndex].id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movement: ship ? ship.engine : 0 }),
      },
    );
    const playerCardsResponse = await fetch(
      `http://localhost:4000/api/v1/card/player-cards/${players[nextIndex].id}`,
    );
    if (!playerCardsResponse.ok)
      throw new Error("Error al cargar las cartas del jugador");
    const playerCardsData = await playerCardsResponse.json();
    await setPlayerCards(playerCardsData);
  };

  const handleMovePlayer = async (targetNodeId: string) => {
    if (!currentPlayer) return;

    const tile = tiles.find((t) => t.externalId === targetNodeId);
    const ship = ships.find((s) => s.id === currentPlayer.shipId);
    const playerChip = playersChips.find((p) => p.id === currentPlayer.id);
    let distance = 0;
    let validMove = false;

    if (ship && tile && playerChip) {
      if (tile.positionY === ship.positionY) {
        distance = calculateDistance(
          {
            positionX: ship.positionX,
            positionY: ship.positionY,
            externalId: ship.externalId,
          } as TileDTO,
          tile,
        );
        distance =
          distance +
          calculateNumberOfPlayersBetween(
            ship.positionX,
            tile.positionX,
            distance,
          );
        if (distance <= currentPlayer.movement) {
          validMove = true;
        }
      } else if (
        ship.externalId.includes("space_station") &&
        spaceStationLandings[ship.externalId]
      ) {
        const landingTileId =
          spaceStationLandings[ship.externalId][
            tile.positionY === 1 ? 0 : tile.positionY === 0 ? 0 : 1
          ];
        const landingTile = tiles.find((t) => t.externalId === landingTileId);
        if (landingTile) {
          distance = calculateDistance(landingTile, tile) + 1;
          distance =
            distance +
            calculateNumberOfPlayersBetween(
              landingTile.positionX,
              tile.positionX,
              distance,
            );
        }
        if (distance <= currentPlayer.movement) {
          validMove = true;
        }
      }
      if (validMove) {
        await fetch(`http://localhost:4000/api/v1/ship/${ship.id}/move`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newX: tile.positionX,
            newY: tile.positionY,
            externalId: targetNodeId,
          }),
        });
        ship.positionX = tile.positionX;
        ship.positionY = tile.positionY;
        ship.externalId = targetNodeId;
        playerChip.coordX = tile.positionX;
        playerChip.coordY = tile.positionY;
        playerChip.externalId = targetNodeId;
        currentPlayer.movement = currentPlayer.movement - distance;
        setPlayersChips([...playersChips]);
        await fetch(`http://localhost:4000/api/v1/player/${currentPlayer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movement: currentPlayer.movement }),
        });
      }
    }
  };

  const calculateNumberOfPlayersBetween = (
    shipX: number,
    tileX: number,
    distance: number,
  ) => {
    if (distance === 1) return 0;
    const numPlayers = playersChips.filter((p) => {
      if (p.id === currentPlayer?.id) return false;
      const playerToShip = Math.abs(p.coordX - shipX);
      const playerToDestiny = Math.abs(p.coordX - tileX);
      if (playerToShip < distance && playerToDestiny < distance) {
        return true;
      }
      return false;
    }).length;
    return numPlayers;
  };

  const calculateDistance = (tile1: TileDTO, tile2: TileDTO): number => {
    const maxPlanetNum = [32, 16, 10];
    const distance1 = Math.abs(tile1.positionX - tile2.positionX);
    const distance2 =
      tile1.positionX > tile2.positionX
        ? tile2.positionX + (maxPlanetNum[tile2.positionY] - tile1.positionX)
        : tile1.positionX + (maxPlanetNum[tile1.positionY] - tile2.positionX);
    return Math.min(distance1, distance2);
  };

  const maxDistance = (player: PlayerDTO, ship: ShipDTO) => {
    const maxPlanetNum = [32, 16, 10];
    const distOrbit: Record<number, number[]> = {};

    let dir1 = ship.positionX - player.movement;
    if (dir1 < 0) dir1 += maxPlanetNum[ship.positionY];

    const dir2 =
      (ship.positionX + player.movement) % maxPlanetNum[ship.positionY];

    distOrbit[ship.positionY] = [dir1, dir2];

    if (ship.externalId.includes("space_station")) {
      const landingTilesId = spaceStationLandings[ship.externalId];
      landingTilesId.forEach((landingTileId) => {
        const tile = tiles.find((t) => t.externalId === landingTileId);
        if (tile) {
          let dir3 = tile.positionX - player.movement;
          if (dir3 < 0) dir3 += maxPlanetNum[tile.positionY];
          const dir4 =
            (tile.positionX + player.movement) % maxPlanetNum[tile.positionY];
          distOrbit[tile.positionY] = [dir3, dir4];
        }
      });
    }
    return distOrbit;
  };

  return !loading ? (
    <main
      className={styles.pageContainer}
      style={{
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#0a0c10", // Asegura un fondo oscuro uniforme si queda espacio
      }}
    >
      {/* Contenedor principal limitado a la altura de la pantalla (Viewport) */}
      <div
        style={{
          display: "flex",
          width: "100%",
          maxWidth: "1800px",
          height: "100vh", // Limita la altura total al 100% de la ventana
          margin: "0 auto",
          gap: "20px",
          alignItems: "stretch",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        {/* COLUMNA IZQUIERDA */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px", // Cambiado a gap para mejor distribución reactiva
            width: "320px",
            flexShrink: 0,
          }}
        >
          {/* Recuadro Azul/Morado */}
          <div className={styles.turnContainer}>
            {currentPlayer ? (
              <>
                {/* 1. Indicador LED con la variable de color inyectada dinámicamente */}
                <div
                  className={styles.turnLed}
                  style={
                    {
                      "--player-color": currentPlayer.color || "#ffffff",
                    } as React.CSSProperties
                  }
                />

                {/* 2. Textos del Turno */}
                <div className={styles.turnTextWrapper}>
                  <span className={styles.turnLabel}>Turno Actual</span>
                  <span className={styles.turnPlayerName}>
                    {currentPlayer.name}
                  </span>
                </div>

                {/* 3. 🚀 NUEVO: Módulo de Movimientos Restantes (Alineado a la derecha) */}
                <div className={styles.movementWrapper}>
                  <span className={styles.movementLabel}>MOVIMIENTOS</span>
                  <span className={styles.movementValue}>
                    {/* Asumiendo que guardas el movimiento actual y el máximo. 
              Si solo tienes una variable, puedes dejar solo {currentPlayer.movement} */}
                    {currentPlayer.movement}{" "}
                    <span className={styles.movementMax}>
                      /{" "}
                      {ships.find((s) => s.id == currentPlayer.shipId)
                        ?.engine || 3}
                    </span>
                  </span>
                </div>
              </>
            ) : (
              <span className={styles.turnLoading}>Esperando jugadores...</span>
            )}
          </div>

          {/* Recuadro Amarillo (Tienda) */}
          <div
            style={{
              border: "3px solid #FFD700",
              flex: 1, // Ahora crece dinámicamente según el alto disponible
              minHeight: 0, // Truco de flexbox para permitir que el contenedor interno haga scroll si es necesario
              borderRadius: "8px",
              backgroundColor: "rgba(0,0,0,0.3)",
              overflow: "hidden",
            }}
          >
            <StoreComponent
              cards={storeCards.slice(0, 3)}
              gameId={Number(gameId)}
            />
          </div>

          {/* Botón Verde */}
          <button
            onClick={async () => await nextPlayer()}
            style={{
              border: "3px solid #00FF00",
              height: "65px",
              borderRadius: "8px",
              backgroundColor: "rgba(0, 255, 0, 0.1)",
              color: "#00FF00",
              fontWeight: "bold",
              cursor: "pointer",
              textTransform: "uppercase",
              flexShrink: 0,
            }}
          >
            Pasar Turno
          </button>
        </div>

        {/* TABLERO CENTRAL (Ajustado dinámicamente) */}
        <div
          className={styles.boardWrapper}
          style={{
            flex: 1,
            position: "relative",
            height: "100%", // Obliga al contenedor a usar el espacio vertical asignado
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            src="/images/tablero.png"
            alt="Project Icarus"
            fill
            priority
            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 80vw, 1200px"
            style={{ objectFit: "contain" }} // Evita que la imagen se deforme o se salga de su contenedor
          />

          <svg
            viewBox="0 0 1790 1787"
            className={styles.svgOverlay}
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              maxHeight: "100%", // Asegura que el SVG siga las mismas reglas restrictivas de la imagen
            }}
          >
            <BoardGrid currentRound={round} onNodeClick={handleMovePlayer} />
            <EntitiesLayer playersData={playersChips} />
          </svg>
        </div>

        {/* COLUMNA DERECHA */}
        <div style={{ width: "320px", flexShrink: 0 }}>
          <div
            style={{
              border: "3px solid #FF0000",
              height: "100%",
              borderRadius: "8px",
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          >
            {currentPlayer && (
              <PlayerDataComponent
                shipData={ships.find(
                  (s) => s.id === Number(currentPlayer.shipId),
                )}
                cargoData={storages.find(
                  (s) => s.id === Number(currentPlayer.storageId),
                )}
                cardsData={playerCards}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  ) : (
    <main>
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <span className={styles.loadingText}>Cargando partida...</span>
      </div>
    </main>
  );
}
