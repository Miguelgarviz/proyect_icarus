"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import BoardGrid from "./BoardGrid";
import EntitiesLayer, { PLAYER_IMAGES } from "./EntitiesLayer";
import styles from "./styles/game.module.css";
import modalStyles from "./styles/modal.module.css"
import turnStyles from "./styles/turnPlayer.module.css"
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
import {DeathEndModal, DrillModal, GoalModal, NormalCardModal, ScannerCardModal, SuperNovaEndModal, SwapCardModal, VictoryModal} from "./modalComponents";

interface DrillResponse {
  empty: boolean;
  valid: boolean;
  type: "green" | "red" | "yellow" | "supernova" | "";

  drillCard?: DrillCardDTO; 
}

interface GoalResponse {
  difficulty: string
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
      await fetchActualPlayer();
      await fetchActualTile();
      await fetchStorages();

      const players = await fetchPlayers();
      const ships = await fetchShips();

      if (players && ships) {
          calculatePlayerChips(players, ships);
      }

      await fetchMaxDistance();
      await fetchPlayersCards();

      

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
<div className={turnStyles.turnContainer}>
  {currentPlayer ? (
    <>
      <div className={turnStyles.turnTextWrapper}>
        {/* El LED circular alineado a la izquierda del texto */}
        <div
          className={turnStyles.turnLed}
          style={
            {
              "--player-color": currentPlayer.color || "#ffffff",
            } as React.CSSProperties
          }
        />
        <div>
          <span className={turnStyles.turnLabel}></span>
          <span className={turnStyles.turnPlayerName}>
            {currentPlayer.name}
          </span>
        </div>
      </div>

      {/* Bloque de movimientos con la aclaración textual integrada debajo */}
      <div 
        className={turnStyles.movementWrapper} 
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}
      >
        <div className={turnStyles.movementBadge} title="Movimientos disponibles / máximos">
          <span className={turnStyles.movementValue}>
            {currentPlayer.movement}
            <span className={turnStyles.movementMax}>
              /{ships.find((s) => s.id == currentPlayer.shipId)?.engine || 3}
            </span>
          </span>
        </div>
        <small style={{ color: '#8b949e', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          movimientos restantes
        </small>
      </div>
    </>
  ) : (
    <span className={turnStyles.turnLoading}>Esperando jugadores...</span>
  )}
</div>

          <div>
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
          className={modalStyles.goalMenuButton}
          onClick={() => setIsGoalModalOpen(true)}
          title="Ver Objetivos de la Misión"
        >
          🎯 Misión
        </button>

        {/* CARTEL DE ALERTA UBICADO EN LA ESQUINA SUPERIOR DERECHA (TAMAÑO REDUCIDO) */}
        {achiveGoal && (
          <div className={modalStyles.boardFloatingAlertMini}>
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
{/*MODAL EXCAVAR */}
{isDrillModalOpen && drillResult && drillResult.valid && (
  <div>
    <DrillModal
      drillResult={drillResult}
      drillDeeper={drillDeeper}
      setDrillDeeper={setDrillDeeper}
      setDrillResult={setDrillResult}
      setIsDrillModalOpen={setIsDrillModalOpen}
      handleDrillDeeper={handleDrillDeeper}
    />
  </div>
)}
{/*MODAL DERROTA MUERTE */}
{isGameOverDeathModalOpen && (
  <div>
    <DeathEndModal
      handleResetGame={handleResetGame}
    />
  </div>
)}
{/*MODAL DERROTA SUPERNOVA */}
{isGameOverExplosionModalOpen && (
  <div>
    <SuperNovaEndModal
      handleResetGame={handleResetGame}
    />
  </div>
)}
{/*MODAL VICTORIA */}
{isVictoryModalOpen && currentPlayer && (
  <div>
    <VictoryModal
      currentPlayer={currentPlayer}
      handleResetGame={handleResetGame}
    />
  </div>
)}
{/*MODAL CARTAS GENERAL */}
{isPlayCardModalOpen && selectedCardToPlay && (
  <div>
    <NormalCardModal
      selectedCardToPlay={selectedCardToPlay}
      getAdjacentPlayers={getAdjacentPlayers}
      getResourcesCardsForEHCard={getResourcesCardsForEHCard}
      handlePlayCardEffect={handlePlayCardEffect}
      setIsPlayCardModalOpen={setIsPlayCardModalOpen}
      setSelectedCardToPlay={setSelectedCardToPlay}
    />
  </div>
)}
{/*MODAL CARTAS ESCANER */}
{isScannerModalOpen && scannerOptions.length > 0 && selectedCardToPlay &&(
  <div>
    <ScannerCardModal
      scannerOptions={scannerOptions}
      handlePlayCardEffect={handlePlayCardEffect}
      selectedCardToPlay={selectedCardToPlay}
    />
  </div>
)}
{/*MODAL CARTA CAMBIO */}
{isSwapCardModalOpen && adjacentPlayers.length > 0 && selectedCardToPlay &&(
  <div>
    <SwapCardModal
      adjacentPlayers={adjacentPlayers}
      selectedCardToPlay={selectedCardToPlay}
      handlePlayCardEffect={handlePlayCardEffect}
      setIsSwapCardModalOpen={setIsSwapCardModalOpen}
      setSelectedCardToPlay={setSelectedCardToPlay}
    />
  </div>
)}
{/*MODAL OBJETIVO */}
{isGoalModalOpen && goalImageUrl && (
        <div>
          <GoalModal
            goalImageUrl={goalImageUrl}
            setIsGoalModalOpen={setIsGoalModalOpen}
          />
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