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
  const [game, setGame] = useState<GameDTO>();
  const [currentPlayer, setCurrentPlayer] = useState<PlayerDTO>();
  const [ships, setShips] = useState<ShipDTO[]>([]);
  const [playersChips, setPlayersChips] = useState<PlayerChipDTO[]>([]);
  const [storeCards, setStoreCards] = useState<CardDTO[]>([]);
  const [playerCards, setPlayerCards] = useState<CardDTO[]>([]);
  const [storages, setStorages] = useState<StorageDTO[]>([]);
  const [reachableTiles, setReachableTiles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const gameId = params.id;

  useEffect(() => {
    async function loadAllGameData() {
      setLoading(true);
      try {
        const players = await fetchPlayers();
        const freshShips = await fetchShips();
        await fetchGame();
        await fetchStorages();
        await fetchActualPlayer();
        await fetchMaxDistance();
        await fetchPlayersCards();
        await fetchStoreCards();

        if (players && freshShips) {
          calculatePlayerChips(players, freshShips);
        }
      } catch (error) {
        console.error("Error cargando los datos iniciales de la partida:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAllGameData();
  }, [gameId]);


  async function fetchPlayers() {
    try {
      const response = await fetch(`http://localhost:4000/api/v1/game/${gameId}/players`);
      if (!response.ok) throw new Error("Error al cargar jugadores");
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchGame() {
    try {
      const response = await fetch(`http://localhost:4000/api/v1/game/${gameId}`);
      if (!response.ok) throw new Error("Error al cargar la partida");
      const gameData = await response.json();
      setGame(gameData);
      return gameData;
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchShips() {
    try {
      const response = await fetch(`http://localhost:4000/api/v1/game/${gameId}/ships`);
      if (!response.ok) throw new Error("Error al cargar naves");
      const shipsData = await response.json();
      setShips(shipsData);
      return shipsData;
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchStorages() {
    try {
      const response = await fetch(`http://localhost:4000/api/v1/game/${gameId}/storages`);
      if (!response.ok) throw new Error("Error al cargar almacenamiento");
      const storageData = await response.json();
      setStorages(storageData);
      return storageData;
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchActualPlayer() {
    try {
      const response = await fetch(`http://localhost:4000/api/v1/game/${gameId}/current-player`);
      if (!response.ok) throw new Error("Error al cargar el jugador actual");
      const currentPlayerData = await response.json();
      setCurrentPlayer(currentPlayerData);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchStoreCards() {
    try {
      const response = await fetch(`http://localhost:4000/api/v1/game/${gameId}/store-cards`);
      if (!response.ok) throw new Error("Error al cargar las cartas de la tienda");
      const storeCardsData = await response.json();
      setStoreCards(storeCardsData);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchPlayersCards() {
    try {
      const response = await fetch(`http://localhost:4000/api/v1/game/${gameId}/players-cards`);
      if (!response.ok) throw new Error("Error al cargar las cartas del jugador");
      const playerCardsData = await response.json();
      setPlayerCards(playerCardsData);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchMaxDistance() {
    try {
      const response = await fetch(`http://localhost:4000/api/v1/game/${gameId}/max-range`);
      if (!response.ok) throw new Error("Error al cargar las casillas a las que puede ir el jugador");
      const maxTilesData = await response.json();
      setReachableTiles(maxTilesData);
    } catch (error) {
      console.error(error);
    }
  }

  // --- FUNCIONES DE LÓGICA Y ACCIONES ---

  function calculatePlayerChips(playersData: PlayerDTO[], shipsData: ShipDTO[]) {
    const newChips: PlayerChipDTO[] = [];
    const limit = Math.min(playersData.length, shipsData.length);
    
    for (let i = 0; i < limit; i++) {
      newChips.push({
        id: playersData[i].id,
        color: playersData[i].color,
        coordX: shipsData[i].positionX,
        coordY: shipsData[i].positionY,
        externalId: shipsData[i].externalId,
      });
    }
    setPlayersChips(newChips);
  }

  async function nextPlayer() {
    try {
      await fetch(`http://localhost:4000/api/v1/game/${gameId}/next-turn`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      await fetchActualPlayer();
      await fetchPlayersCards();
      await fetchMaxDistance();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleMovePlayer(targetNodeId: string) {
    try {
      await fetch(`http://localhost:4000/api/v1/game/${gameId}/move-player`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalId: targetNodeId }),
      });
      
      const players = await fetchPlayers();
      const freshShips = await fetchShips();
      await fetchGame();
      await fetchActualPlayer();
      await fetchMaxDistance();

      if (players && freshShips) {
        calculatePlayerChips(players, freshShips);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleUpgradeShip(system:string){
    try{
      await fetch(`http://localhost:4000/api/v1/game/${gameId}/upgrade-ship`,{
        method: "PUT",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ system: system})
      });
      await fetchShips();
    }catch(error){
      console.error(error);
    }
  }

  async function handleChangeMinerals(system: string){
    try{
      await fetch(`http://localhost:4000/api/v1/game/${gameId}/change-minerals`,{
        method: "PUT",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ system: system})
      });
      await fetchStorages();
    }catch(error){
      console.error(error);
    }
  }

  const handleBuy = async (cardId: number) => {
    try {
      const response = await fetch(`http://localhost:4000/api/v1/game/${gameId}/buy-card`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId })
      });
      if (!response.ok) throw new Error("Error");
      await fetchStoreCards();
      await fetchStorages();
      await fetchPlayersCards();
    } catch (error) {
      console.error(error);
    }
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
              handleBuy={handleBuy}
              externalId={ships.find((s) => s.id===currentPlayer?.shipId)?.externalId!}
              redMinerals={storages.find((s) => s.id === currentPlayer?.storageId)?.red!}
              numPlayerCards={playerCards.length}
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
            <BoardGrid
              currentRound={game?.round!}
              onNodeClick={handleMovePlayer}
              allowedNodes={reachableTiles}
            />
            <EntitiesLayer 
              playersData={playersChips}
            />
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
                handleUpgrade={handleUpgradeShip}
                handleChange={handleChangeMinerals}
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
