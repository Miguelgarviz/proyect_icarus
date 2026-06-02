"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import BoardGrid from "./BoardGrid";
import EntitiesLayer from "./EntitiesLayer";
import styles from "./game.module.css";
import { useParams, useRouter } from "next/navigation";
import { PlayerDTO, PlayerChipDTO } from "../../../lib/dto/playerDTO";
import { ShipDTO } from "../../../lib/dto/shipDTO";
import { CardDTO } from "../../../lib/dto/storeDTO";
import { StorageDTO } from "../../../lib/dto/storageDTO";
import { GameDTO } from "../../../lib/dto/gameDTO";
import { TileDTO } from "../../../lib/dto/tileDTO";
import { DrillCardDTO } from "../../../lib/dto/drillCardDTO";
import StoreComponent from "./StoreComponent";
import PlayerDataComponent from "./playerDataComponent";

// 🌟 Definimos una interfaz limpia para estructurar lo que responde tu backend al excavar
interface DrillResponse {
  empty: boolean;
  valid: boolean;
  type: "green" | "red" | "yellow" | "supernova" | "";

  drillCard?: DrillCardDTO; // Solo vendrá si el tipo es "card"
}


export default function GamePage() {
  const router = useRouter();
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
  const [actualTile, setActualTile] = useState<TileDTO>();
  const [achiveGoal, setAchiveGoal] = useState<boolean>(false)
  
  // 🌟 NUEVOS ESTADOS: Para controlar la visibilidad y el contenido del modal de excavación
  const [isDrillModalOpen, setIsDrillModalOpen] = useState<boolean>(false);
  const [drillResult, setDrillResult] = useState<DrillResponse | null>(null);
  const [drillDeeper, setDrillDeeper] = useState<boolean>(false);
  const [isGameOverDeathModalOpen, setIsGameOverDeathModalOpen] = useState<boolean>(false);
  const [isGameOverExplosionModalOpen, setIsGameOverExplosionModalOpen] = useState<boolean>(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState<boolean>(false);

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
        await fetchActualTile();
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

      const responseGoal = await fetch(`http://localhost:4000/api/v1/game/${gameId}/goal`);
      if(!responseGoal.ok) throw new Error("Error al cargar el goal");
      const goalData = await responseGoal.json();
      console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
      console.log(goalData)
      setAchiveGoal(goalData)

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

  async function fetchActualTile(){
    try{
      const response = await fetch(`http://localhost:4000/api/v1/game/${gameId}/current-tile`)
      if(!response.ok) throw new Error("Error al cargar la casilla actual del jugador");
      const tileData = await response.json();
      setActualTile(tileData);
    }catch(error){
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
      const response = await fetch(`http://localhost:4000/api/v1/game/${gameId}/next-turn`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      const result = await response.json();
      if (result.defeat) {
        if(result.type === "death"){
          setIsGameOverDeathModalOpen(true)
        }else if(result.type === "explote"){
          setIsGameOverExplosionModalOpen(true)
        }
      } else {
        await fetchActualPlayer();
        await fetchShips();
        await fetchStorages();
        await fetchPlayersCards();
        await fetchMaxDistance();
        await fetchActualTile();
        await fetchGame();
      }
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
      await fetchStorages();
      await fetchActualTile();

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
      await fetchStorages();
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

  async function handleBuy (cardId: number) {
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

  async function handleDrill(){
    try {
      const response = await fetch(`http://localhost:4000/api/v1/game/${gameId}/drill`, {
        method: "PUT", // O PUT, dependiendo de cómo lo tengas configurado
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) throw new Error("Fallo en los sistemas de perforación");
      
      const data: DrillResponse = await response.json();
      
      // 1. Guardamos la telemetría devuelta por el servidor en el estado
      if(data.valid){
        setDrillResult(data);
        // 2. Desplegamos el modal en pantalla
        setIsDrillModalOpen(true);
        await fetchStorages();
        await fetchGame();
        await fetchShips();
        await fetchActualTile();
      }
      

    } catch (error) {
      console.error("Error en la perforación:", error);
    }
  }

  async function handleDrillDeeper(){
    try {
      const response = await fetch(`http://localhost:4000/api/v1/game/${gameId}/drill-deeper`, {
        method: "PUT", // O PUT, dependiendo de cómo lo tengas configurado
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) throw new Error("Fallo en los sistemas de perforación");
      
      const data: DrillResponse = await response.json();
      
      // 1. Guardamos la telemetría devuelta por el servidor en el estado
      if(data.valid){
        setDrillResult(data);
        // 2. Desplegamos el modal en pantalla
        setIsDrillModalOpen(true);
        await fetchStorages();
        await fetchGame();
        await fetchShips();
        await fetchActualTile();
      }
      

    } catch (error) {
      console.error("Error en la perforación:", error);
    }
  }

  async function handleResetGame(){
    setIsGameOverDeathModalOpen(false);
    setIsGameOverExplosionModalOpen(false);
    router.push(`http://localhost:3000`);
  }

  async function handleVictory(){
    setIsVictoryModalOpen(true)
  }

  console.log(achiveGoal , "initial_"+(currentPlayer?.turnOrder!+1))
  return !loading ? (
    <main
      className={styles.pageContainer}
      style={{
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#0a0c10", 
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          maxWidth: "1800px",
          height: "100vh", 
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
            gap: "15px", 
            width: "320px",
            flexShrink: 0,
          }}
        >
          <div className={styles.turnContainer}>
            {currentPlayer ? (
              <>
                <div
                  className={styles.turnLed}
                  style={
                    {
                      "--player-color": currentPlayer.color || "#ffffff",
                    } as React.CSSProperties
                  }
                />

                <div className={styles.turnTextWrapper}>
                  <span className={styles.turnLabel}>Turno Actual</span>
                  <span className={styles.turnPlayerName}>
                    {currentPlayer.name}
                  </span>
                </div>

                <div className={styles.movementWrapper}>
                  <span className={styles.movementLabel}>MOVIMIENTOS</span>
                  <span className={styles.movementValue}>
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

          <div
            style={{
              border: "3px solid #FFD700",
              flex: 1, 
              minHeight: 0, 
              borderRadius: "8px",
              backgroundColor: "rgba(0,0,0,0.3)",
              overflow: "hidden",
            }}
          >
            {!currentPlayer?.isDead && <StoreComponent
              cards={storeCards.slice(0, 3)}
              handleBuy={handleBuy}
              externalId={ships.find((s) => s.id===currentPlayer?.shipId)?.externalId!}
              redMinerals={storages.find((s) => s.id === currentPlayer?.storageId)?.red!}
              numPlayerCards={playerCards.length}
            />}
          </div>

          {!(achiveGoal && actualTile?.externalId === "initial_"+(currentPlayer?.turnOrder! + 1))?(<button
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
          </button>):
          (<button
            onClick={async () => await handleVictory()}
            style={{
              border: "3px solid #c300ff",
              height: "65px",
              borderRadius: "8px",
              backgroundColor: "#c300ff31",
              color: "#de72ff",
              fontWeight: "bold",
              cursor: "pointer",
              textTransform: "uppercase",
              flexShrink: 0,
            }}
          >
            Salir del sistema
          </button>)}
        </div>

        {/* TABLERO CENTRAL */}
        
        <div
          className={styles.boardWrapper}
          style={{
            flex: 1,
            position: "relative",
            height: "100%", 
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
            style={{ objectFit: "contain" }} 
          />

          <svg
            viewBox="0 0 1790 1787"
            className={styles.svgOverlay}
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              maxHeight: "100%", 
            }}
          >
            <BoardGrid
              currentRound={game?.supernovaLvL!}
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
            {currentPlayer && !currentPlayer.isDead &&(
              <PlayerDataComponent
                shipData={ships.find(
                  (s) => s.id === Number(currentPlayer.shipId),
                )}
                cargoData={storages.find(
                  (s) => s.id === Number(currentPlayer.storageId),
                )}
                cardsData={playerCards}
                actualTile={actualTile!}
                handleUpgrade={handleUpgradeShip}
                handleChange={handleChangeMinerals}
                handleDrill={handleDrill} // Pasamos la función actualizada
              />
            )}
          </div>
        </div>
        
      </div>

      {/* ========================================================================= */}
      {/* 🌟 ESQUEMA DEL MODAL DE EXCAVACIÓN (RENDERIZADO CONDICIONAL)             */}
      {/* ========================================================================= */}
      {isDrillModalOpen && drillResult && drillResult.valid && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      
      {/* CABECERA GENERAL DEL MODAL */}
      <h3 className={styles.modalTitle}>Resultado de la excavación</h3>
      
      <div className={styles.modalBody}>
        
        {/* CASO 1: SECTOR VACÍO */}
        {drillResult.empty && (
          <div className={styles.resultEmpty}>
            <div className={styles.resultIcon}>🌌</div>
            <h4>Excavación sin resultados</h4>
            <p className={styles.resultDescription}>
              Los escáneres térmicos confirman que el núcleo de este sector está completamente agotado.
            </p>
          </div>
        )}

        {/* CASO 2: EVENTO SUPERNOVA (Solo si viene la carta Y tiene el flag activo) */}
        {drillResult.drillCard && drillResult.drillCard.isSupernovaCard && !drillResult.empty && (
          <div className={styles.resultSupernova}>
            <div className={styles.resultIcon}>💥</div>
            <h4>¡Alerta de Supernova!</h4>
            <p className={styles.resultDescription}>
              La perforación ha desestabilizado el núcleo cuántico provocando una descarga crítica.
            </p>
          </div>
        )}

        {/* CASO 3: RECOMPENSA DE CARTA DE RECURSOS (Solo si NO es supernova y NO está vacío) */}
        {drillResult.drillCard && !drillResult.drillCard.isSupernovaCard && !drillResult.empty && (
          <div className={styles.resultCard}>
            <div className={styles.resultIcon}>⭐</div>
            <h4>Excavación Exitosa</h4>
            <p className={styles.resultDescription}>
              Sistemas de carga estables. Se han refinado los siguientes materiales del subsuelo:
            </p>
            
            {/* Contenedor visual del recurso extraído */}
            <div className={`${styles.resourceDisplay} ${styles[drillResult.type]}`}>
              <span className={styles.resourceAmount}>
                {(() => {
                  switch (drillResult.type) {
                    case "green":
                      return `+${drillResult.drillCard.greenResources ?? 0}`;
                    case "red":
                      return `+${drillResult.drillCard.redResources ?? 0}`;
                    case "yellow":
                      return `+${drillResult.drillCard.yellowResources ?? 0}`;
                    default:
                      return "0";
                  }
                })()}
              </span>
              <span className={styles.resourceLabel}>
                Mineral {drillResult.type === "green" ? "Verde" : drillResult.type === "red" ? "Rojo" : "Amarillo"}
              </span>
              
            </div>
            
          </div>
        )}

      </div>

      {/* BOTÓN DE CIERRE */}
      {(drillResult.type === "red" || drillResult.type === "yellow" || drillResult.empty) && !drillDeeper && 
              <button
                className={styles.modalDrillDeeperButton}
                onClick={() => {
                  setDrillDeeper(true);
                  handleDrillDeeper()}
                }
              >
                Excavar mas profundo
              </button>}
      
      <button 
        className={styles.modalCloseButton}
        onClick={() => {
          setIsDrillModalOpen(false);
          setDrillResult(null);
          setDrillDeeper(false);
        }}
      >
        Confirmar Informe
      </button>

    </div>
  </div>
  
)}
{/* MODAL 1: TODOS LOS JUGADORES MUERTOS (CALAVERA) */}
{isGameOverDeathModalOpen && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContentGameOver}>
      <div className={styles.modalBodyGameOver}>
        <div className={`${styles.resultIcon} ${styles.iconDeath}`}>💀</div>
        <h3 className={styles.modalTitleGameOver}>Misión Fracasada</h3>
        <p className={styles.gameOverDescription}>
          Los sistemas vitales de todas las naves se han extinguido. Ningún tripulante ha sobrevivido a los peligros del sector Icaro.
        </p>
      </div>
      
      <button 
        className={styles.modalRetryButton}
        onClick={() => handleResetGame()}
      >
        Volver al Menú Principal
      </button>
    </div>
  </div>
)}

{/* MODAL 2: EXPLOSIÓN DEL SISTEMA (SOL / SUPERNOVA) */}
{isGameOverExplosionModalOpen && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContentGameOver}>
      <div className={styles.modalBodyGameOver}>
        <div className={`${styles.resultIcon} ${styles.iconExplosion}`}>☀️</div>
        <h3 className={styles.modalTitleGameOver}>Sistema Destruido</h3>
        <p className={styles.gameOverDescription}>
          La estabilidad estelar ha llegado a su límite crítico. El sol del sistema ha colapsado en una supernova, desintegrando todo a su paso.
        </p>
      </div>
      
      <button 
        className={styles.modalRetryButton}
        onClick={() => handleResetGame()}
      >
        Volver al Menú Principal
      </button>
    </div>
  </div>
)}
{isVictoryModalOpen && currentPlayer && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContentVictory}>
      <div className={styles.modalBodyVictory}>
        <div className={styles.iconVictory}>🏆</div>
        <h3 className={styles.modalTitleVictory}>¡Misión Cumplida!</h3>
        
        <div className={styles.victoryPilotBadge}>
          Comandante: <span className={styles.victoryPilotName}>{currentPlayer.name}</span>
        </div>

        <p className={styles.victoryDescription}>
          Los recolectores de carga informan de un éxito absoluto. Has asegurado los minerales necesarios y has iniciado la secuencia de salto hiperespacial justo a tiempo. 
        </p>
        
        <p className={styles.victoryLore}>
          La nave rompe la gravedad del sector Ícaro dejando atrás el colapso estelar. Tu nombre será recordado en los confines de la Galaxia.
        </p>
      </div>
      
      <button 
        className={styles.modalVictoryButton}
        onClick={() => handleResetGame()}
      >
        Regresar al Centro de Mando
      </button>
    </div>
  </div>
)}
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