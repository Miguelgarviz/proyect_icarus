"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import BoardGrid from "./BoardGrid";
import EntitiesLayer, { PLAYER_IMAGES } from "./EntitiesLayer";
import styles from "./game.module.css";
import { useParams, useRouter } from "next/navigation";
import { PlayerDTO, PlayerChipDTO } from "../../../lib/dto/playerDTO";
import { ShipDTO } from "../../../lib/dto/shipDTO";
import { CardDTO, CardTypeDTO } from "../../../lib/dto/storeDTO";
import { StorageDTO } from "../../../lib/dto/storageDTO";
import { GameDTO } from "../../../lib/dto/gameDTO";
import { TileDTO, TileTypeDTO } from "../../../lib/dto/tileDTO";
import { DrillCardDTO } from "../../../lib/dto/drillCardDTO";
import StoreComponent, { CARD_DATA } from "./StoreComponent";
import PlayerDataComponent from "./playerDataComponent";

interface DrillResponse {
  empty: boolean;
  valid: boolean;
  type: "green" | "red" | "yellow" | "supernova" | "";

  drillCard?: DrillCardDTO; 
}

interface GoalResponse {
  difficulty: string
}

const difficultyImages: Record<string, string> = {
  beginner_i: "/images/goals/Beginner_i.png",
  beginner_ii: "/images/goals/Beginner_ii.png",
  easy_i: "/images/goals/Easy_i.png",
  easy_ii: "/images/goals/Easy_ii.png",
  medium_i: "/images/goals/Medium_i.png",
  medium_ii: "/images/goals/Medium_ii.png",
  hard_i: "/images/goals/Hard_i.png",
  hard_ii: "/images/goals/Hard_ii.png",
  extreme_i: "/images/goals/Extreme_i.png",
  extreme_ii: "/images/goals/Extreme_ii.png",
  impossible: "/images/goals/Impossible_i.png",
};


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
  const [selectedCardToPlay, setSelectedCardToPlay] = useState<CardDTO | null>();
  const [scannerOptions, setScannerOptions] = useState<DrillCardDTO[]>([]);
  const [adjacentPlayers, setAdjacentPlayers] = useState<PlayerChipDTO[]>([])
  
  const [isPlayCardModalOpen, setIsPlayCardModalOpen] = useState<boolean>(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState<boolean>(false);
  const [isDrillModalOpen, setIsDrillModalOpen] = useState<boolean>(false);
  const [drillResult, setDrillResult] = useState<DrillResponse | null>(null);
  const [drillDeeper, setDrillDeeper] = useState<boolean>(false);
  const [isGameOverDeathModalOpen, setIsGameOverDeathModalOpen] = useState<boolean>(false);
  const [isGameOverExplosionModalOpen, setIsGameOverExplosionModalOpen] = useState<boolean>(false);
  const [isSwapCardModalOpen, setIsSwapCardModalOpen] = useState<boolean>(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState<boolean>(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const [goalImageUrl, setGoalImageUrl] = useState<string>();

  const gameId = params.id;

  useEffect(() => {
    async function loadAllGameData() {
      setLoading(true);
      try {
        await getGoal();
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

  async function getGoal(){
    try{
      const response = await fetch(`http://localhost:4000/api/v1/game/${gameId}/get-goal`)
      if(!response.ok) throw new Error("Error al cargar el goal")
      const goal:GoalResponse = await response.json();
      console.log(goal.difficulty)
      setGoalImageUrl(goal.difficulty)
    }catch(error){
      console.error(error)
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


  function calculatePlayerChips(playersData: PlayerDTO[], shipsData: ShipDTO[]) {
    const newChips: PlayerChipDTO[] = [];
    const limit = Math.min(playersData.length, shipsData.length);

    for (let i = 0; i < limit; i++) {
      newChips.push({
        id: playersData[i].id,
        name: playersData[i].name,
        color: playersData[i].color,
        coordX: shipsData[i].positionX,
        coordY: shipsData[i].positionY,
        isDead: playersData[i].isDead,
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
        const players = await fetchPlayers();
        const freshShips = await fetchShips();
        await getAdjacentPlayers(false);
        await fetchActualPlayer();
        await fetchStorages();
        await fetchPlayersCards();
        await fetchMaxDistance();
        await fetchActualTile();
        await fetchGame();

        if (players && freshShips) {
          calculatePlayerChips(players, freshShips);
        }
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
      await getAdjacentPlayers(false);
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
      await fetchActualPlayer();
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
        method: "PUT", 
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) throw new Error("Fallo en los sistemas de perforación");
      
      const data: DrillResponse = await response.json();
      
      if(data.valid){
        setDrillResult(data);
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
        method: "PUT", 
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) throw new Error("Fallo en los sistemas de perforación");
      
      const data: DrillResponse = await response.json();
      
      if(data.valid){
        setDrillResult(data);
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

  async function handleGetCard(card: CardDTO){
    if(!currentPlayer?.isDead && card.playerId && card.playerId===currentPlayer?.id){
      setSelectedCardToPlay(card),
      setIsPlayCardModalOpen(true)
    }
  }

  async function getResourcesCardsForEHCard(){
    try{
      const response = await fetch(`http://localhost:4000/api/v1/game/${gameId}/get-resource-cards`)
      if(!response.ok) throw new Error("Error al cargar las cartas de recursos para la carta del jugador");
      const resourcesDrillData = await response.json();
      setScannerOptions(resourcesDrillData)
      setIsScannerModalOpen(true)
    }catch(error){
      console.error(error)
    }
  }

  async function getAdjacentPlayers(card: boolean){
    try{
      const response = await fetch(`http://localhost:4000/api/v1/game/${gameId}/adjacent-players`)
      if(!response.ok) throw new Error("Error al cargar las cartas de recursos para la carta del jugador");
      const adjacentPlayersData = await response.json();
      setAdjacentPlayers(adjacentPlayersData)
      if(card) setIsSwapCardModalOpen(true)
    }catch(error){
      console.error(error)
    }
  }

  async function handlePlayCardEffect(card: CardDTO, option: string){
    try{
      await fetch(`http://localhost:4000/api/v1/game/${gameId}/use-card`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( {cardId: card.id, effect: option} )
      })

      setScannerOptions([])

      getAdjacentPlayers(false);
      fetchActualPlayer();
      fetchActualTile();
      fetchStorages();
      fetchShips();
      fetchMaxDistance();
      fetchPlayersCards();

      setIsPlayCardModalOpen(false);
      setIsScannerModalOpen(false);
      setIsSwapCardModalOpen(false);
      setSelectedCardToPlay(null);
    }catch(error){
      console.error(error)
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

  async function handleInitialHelp(){
    try{
      await fetch(`http://localhost:4000/api/v1/game/${gameId}/initial-help`,{
        method:"PUT",
        headers: { "Content-Type": "application/json" }
      })
      await fetchActualPlayer();
      await fetchStorages();
    }catch(error){
      console.error(error)
    }
  }
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
        {/* BOTÓN DE OBJETIVO (ESQUINA SUPERIOR IZQUIERDA) */}
        <button 
          className={styles.goalMenuButton}
          onClick={() => setIsGoalModalOpen(true)}
          title="Ver Objetivos de la Misión"
        >
          🎯 Misión
        </button>

        {/* CARTEL DE ALERTA UBICADO EN LA ESQUINA SUPERIOR DERECHA (TAMAÑO REDUCIDO) */}
        {achiveGoal && (
          <div className={styles.boardFloatingAlertMini}>
            ⚠️ ¡Recursos listos! Puedes huir del sistema 🚀
          </div>
        )}

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
            currentRound={game?.supernovaLvL??0}
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
                actualTile={actualTile??{id:"999",externalId:"externalId", type: TileTypeDTO.EMPTY, positionX: 0, positionY: 0, drillAttempts: 0, gameId: 99} as TileDTO}
                playerMovement={currentPlayer.movement}
                initialHelp = {currentPlayer.initialHelp}
                adjacentPlayers={adjacentPlayers}
                actualRound={game?.supernovaLvL!}
                handleUpgrade={handleUpgradeShip}
                handleChange={handleChangeMinerals}
                handleDrill={handleDrill}
                handleCard={handleGetCard}
                handleInitialHelp={handleInitialHelp}
              />
            )}
          </div>
        </div>
        
      </div>

{isDrillModalOpen && drillResult && drillResult.valid && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      
      <h3 className={styles.modalTitle}>Resultado de la excavación</h3>
      
      <div className={styles.modalBody}>
        
        {drillResult.empty && (
          <div className={styles.resultEmpty}>
            <div className={styles.resultIcon}>🌌</div>
            <h4>Excavación sin resultados</h4>
            <p className={styles.resultDescription}>
              Los escáneres térmicos confirman que el núcleo de este sector está completamente agotado.
            </p>
          </div>
        )}

        {drillResult.drillCard && drillResult.drillCard.isSupernovaCard && !drillResult.empty && (
          <div className={styles.resultSupernova}>
            <div className={styles.resultIcon}>💥</div>
            <h4>¡Alerta de Supernova!</h4>
            <p className={styles.resultDescription}>
              La perforación ha desestabilizado el núcleo cuántico provocando una descarga crítica.
            </p>
          </div>
        )}

        {drillResult.drillCard && !drillResult.drillCard.isSupernovaCard && !drillResult.empty && (
          <div className={styles.resultCard}>
            <div className={styles.resultIcon}>⭐</div>
            <h4>Excavación Exitosa</h4>
            <p className={styles.resultDescription}>
              Sistemas de carga estables. Se han refinado los siguientes materiales del subsuelo:
            </p>
            
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

      {/* NUEVO CONTENEDOR PARA ARREGLAR LOS BOTONES */}
      <div className={styles.modalActions}>
        {(drillResult.type === "red" || drillResult.type === "yellow" || drillResult.empty) && !drillDeeper && (
          <button
            className={styles.modalDrillDeeperButton}
            onClick={() => {
              setDrillDeeper(true);
              handleDrillDeeper();
            }}
          >
            Excavar más profundo
          </button>
        )}
        
        <button 
          className={styles.modalConfirmButton}
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
  </div>
)}
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
{isPlayCardModalOpen && selectedCardToPlay && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContentCardAction}>
      
      <div className={styles.modalBodyCardAction}>
        <div className={styles.cardActionIcon}>🃏</div>
        <h3 className={styles.modalTitleCardAction}>Activar Tarjeta</h3>
        <p className={styles.cardActionSubtitle}>
          Estás a punto de consumir la carta: <strong className={styles.cardHighlightName}>{CARD_DATA[selectedCardToPlay.type].name}</strong>
        </p>
        <p className={styles.cardActionDescription}>
          {selectedCardToPlay.type.toString() === "TEMPORARY_PATCH" && "Carga un parche de emergencia para reestabilizar uno de los sistemas críticos dañados de tu nave."}
          {selectedCardToPlay.type.toString() === "NEW_DRILL" && "Sincroniza los calibradores de aleación cuántica para llevar la potencia de minado a su umbral máximo."}
          {selectedCardToPlay.type.toString() === "BACKUP_POWER" && "Desvía la energía residual de las baterías secundarias directamente a las celdas defensivas."}
          {selectedCardToPlay.type.toString() === "ROCKET_THRUSTERS" && "Sobrecarga los inyectores de combustible para exprimir un impulso gravitatorio extra este turno."}
          {selectedCardToPlay.type.toString() === "ENHANCED_SCANNER" && "Abrir contenedor de minerales comprado a comerciantes independientes"}
          {selectedCardToPlay.type.toString() === "SLINGSHOT" && "Usa el intercambiador cuántico para poder intercambiar la posición de tu nave con la de otro"}
        </p>
      </div>

      <div className={styles.cardActionButtonsContainer}>
        
        {selectedCardToPlay.type.toString() === "SLINGSHOT" && (
          <>
            <button 
              className={`${styles.actionButton} ${styles.btnDrill}`}
              onClick={() => getAdjacentPlayers(true)}
            >
              🌀 Ver posibles intercambios
            </button>
          </>
        )}

        {selectedCardToPlay.type.toString() === "ENHANCED_SCANNER" && (
          <>
            <button 
              className={`${styles.actionButton} ${styles.btnDrill}`}
              onClick={() => getResourcesCardsForEHCard()}
            >
              📼 Abrir caja de recursos
            </button>
          </>
        )}

        {selectedCardToPlay.type.toString() === "TEMPORARY_PATCH" && (
          <>
            <button 
              className={`${styles.actionButton} ${styles.btnDrill}`}
              onClick={() => handlePlayCardEffect(selectedCardToPlay, "repair_drill")}
            >
              🔧 Reparar Taladro (+5)
            </button>
            <button 
              className={`${styles.actionButton} ${styles.btnShield}`}
              onClick={() => handlePlayCardEffect(selectedCardToPlay, "repair_shield")}
            >
              🛡️ Reforzar Escudo (+5)
            </button>
          </>
        )}

        {selectedCardToPlay.type.toString() === "NEW_DRILL" && (
          <button 
            className={`${styles.actionButton} ${styles.btnDrillMax}`}
            onClick={() => handlePlayCardEffect(selectedCardToPlay, "new_drill")}
          >
            ⚡ Calibrar Taladro al Máximo
          </button>
        )}

        {selectedCardToPlay.type.toString() === "BACKUP_POWER" && (
          <button 
            className={`${styles.actionButton} ${styles.btnShieldMax}`}
            onClick={() => handlePlayCardEffect(selectedCardToPlay, "max_shield")}
          >
            🔋 Sobrecargar Escudos al Máximo
          </button>
        )}

        {selectedCardToPlay.type.toString() === "ROCKET_THRUSTERS" && (
          <button 
            className={`${styles.actionButton} ${styles.btnMovement}`}
            onClick={() => handlePlayCardEffect(selectedCardToPlay, "more_movement")}
          >
            🚀 Activar Postquemadores (+1 Movimiento)
          </button>
        )}

      </div>

      <button 
        className={styles.modalCancelCardButton}
        onClick={() => {
          setIsPlayCardModalOpen(false);
          setSelectedCardToPlay(null);
        }}
      >
        Abortar Acción
      </button>

    </div>
  </div>
)}
{isScannerModalOpen && scannerOptions.length > 0 && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContentScanner}>
      
      <div className={styles.modalBodyScanner}>
        <div className={styles.scannerIcon}>📡</div>
        <h3 className={styles.modalTitleScanner}>Escaneo Mejorado</h3>
        <p className={styles.scannerDescription}>
          Has abierto el contenedor de minerales comprado a mercaderes independientes, que materiales consigues de este contenedor? (Solo se puede elegir una opción)
        </p>
      </div>

      <div className={styles.scannerCardsGrid}>
        {scannerOptions.map((card, index) => {
          return (
            <div 
              key={index} 
              className={styles.scannerCardReward}
              onClick={() => handlePlayCardEffect(selectedCardToPlay??{id:"999", playerId: null, storeId: null, cost: 2, type: CardTypeDTO.BACKUP_POWER} as CardDTO, "resource-card_"+card.id.toString())}
            >
              <div className={styles.cardRewardGlow} />
              
              <div className={styles.rewardStats}>
                {card.greenResources > 0 && (
                  <div className={`${styles.resourceRow} ${styles.resourceGreen}`}>
                    <div className={styles.mineralIconWrapper}>
                      <Image
                        src="/images/icons/green-mineral.png"
                        alt="Mineral Verde"
                        fill
                        sizes="22px"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <span>+{card.greenResources} Verde</span>
                  </div>
                )}
                
                {card.redResources > 0 && (
                  <div className={`${styles.resourceRow} ${styles.resourceRed}`}>
                    <div className={styles.mineralIconWrapper}>
                      <Image
                        src="/images/icons/red-mineral.png"
                        alt="Mineral Rojo"
                        fill
                        sizes="22px"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <span>+{card.redResources} Rojo</span>
                  </div>
                )}
                
                {card.yellowResources > 0 && (
                  <div className={`${styles.resourceRow} ${styles.resourceYellow}`}>
                    <div className={styles.mineralIconWrapper}>
                      <Image
                        src="/images/icons/yellow-mineral.png"
                        alt="Mineral Amarillo"
                        fill
                        sizes="22px"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <span>+{card.yellowResources} Amarillo</span>
                  </div>
                )}
              </div>
              
              <button className={styles.selectRewardButton}>
                Refinar
              </button>
            </div>
          );
        })}
      </div>

    </div>
  </div>
)}
{isSwapCardModalOpen && adjacentPlayers.length > 0 && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContentSwap}>
      
      <div className={styles.modalBodySwap}>
        <div className={styles.swapIcon}>🌀</div>
        <h3 className={styles.modalTitleSwap}>Disruptor de Posición</h3>
        
        <div className={styles.swapActionCost}>
          ⚠️ Coste de Activación: <span className={styles.costHighlight}>2 Puntos de Movimiento</span>
        </div>

        <p className={styles.swapDescription}>
          Sobrecarga los motores de curvatura para entrelazar tu signatura cuántica con una nave adyacente. Selecciona el objetivo para intercambiar vuestras coordenadas:
        </p>
      </div>

      <div className={styles.swapPlayersList}>
        {adjacentPlayers.map((player) => (
          <button
            key={player.id}
            className={styles.swapPlayerCardButton}
            onClick={() => handlePlayCardEffect(selectedCardToPlay ?? {id:"999", playerId: null, storeId: null, cost: 2, type: CardTypeDTO.BACKUP_POWER} as CardDTO, "swap-player_" + player.id.toString())}
          >
            <div className={styles.playerMainInfo}>
              
              <div className={styles.playerShipIconWrapper}>
                <Image
                  src={PLAYER_IMAGES[player.color] || "/images/jugador_azul.png"} 
                  alt={`Nave de ${player.name}`}
                  fill
                  sizes="32px"
                  style={{ objectFit: "contain" }}
                />
              </div>

              <div className={styles.playerTextData}>
                <span className={styles.playerNameText}>{player.name}</span>
                <span className={styles.playerPlanetText}>
                  Ubicación: <strong className={styles.planetHighlight}>{player.externalId.replaceAll("_"," ") || "Sector Desconocido"}</strong>
                </span>
                <span className={styles.playerCoordinatesText}>
                  Cuadrante: <span className={styles.coordinatesHighlight}>[X: {player.coordX}, Y: {player.coordY}]</span>
                </span>
              </div>
            </div>
            <div className={styles.swapActionIndicator}>
              Intercambiar 🔄
            </div>
          </button>
        ))}
      </div>

      <button 
        className={styles.modalCancelSwapButton}
        onClick={() => {
          setIsSwapCardModalOpen(false);
          setSelectedCardToPlay(null);
        }}
      >
        Cancelar Teletransporte
      </button>

    </div>
  </div>
)}
{isGoalModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsGoalModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.modalCloseButton} 
              onClick={() => setIsGoalModalOpen(false)}
            >
              &times;
            </button>
            <h3 className={styles.modalTitle}>Objetivo del Sistema</h3>
            <div className={styles.modalImageContainer}>
              {goalImageUrl ? (
                <Image
                  src={difficultyImages[goalImageUrl]}
                  alt={`Objetivo ${goalImageUrl}`}
                  fill
                  sizes="(max-width: 768px) 80vw, 500px"
                  style={{ objectFit: "contain" }}
                  priority
                />
              ) : (
                <div className={styles.noGoalText}>
                  No se ha detectado ninguna directiva de misión para: "{goalImageUrl ?? "Desconocido"}"
                </div>
              )}
            </div>
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