"use client";

import 'dotenv/config';
import { useState, useEffect, useCallback } from "react";
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
import { getTokenPayload } from "../../../lib/auth";
import { socket } from "../../../lib/sockets";

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
  const [userPlayer, setUserPlayer] = useState<PlayerDTO>();
  const [isMyTurn, setIsMyTurn] = useState<boolean>(false);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [token, setToken] = useState<string>("")

  const [goalImageUrl, setGoalImageUrl] = useState<string>();

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

  const gameId = params.id;
  const payload = getTokenPayload();

  const userId = payload?.sub;

  const fetchPlayers = useCallback(async (authToken: string) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/game/${gameId}/players`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar jugadores");
      }

      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }, [gameId]);

  const getGoal = useCallback(async (authToken: string) => {
    try{
      const response = await fetch(`${BACKEND_URL}/game/${gameId}/get-goal`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if(!response.ok) throw new Error("Error al cargar el goal")
      const goal:GoalResponse = await response.json();
      setGoalImageUrl(goal.difficulty)
    }catch(error){
      console.error(error)
    }
  }, [gameId])

  const fetchGame = useCallback(async (authToken: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/game/${gameId}`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (!response.ok) throw new Error("Error al cargar la partida");
      const gameData: GameDTO = await response.json();
      setGame(gameData);
      return gameData;
    } catch (error) {
      console.error(error);
    }
  }, [gameId])

  const fetchShips = useCallback(async (authToken: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/game/${gameId}/ships`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (!response.ok) throw new Error("Error al cargar naves");
      const shipsData = await response.json();
      setShips(shipsData);
      return shipsData;
    } catch (error) {
      console.error(error);
    }
  }, [gameId])

  const fetchStorages = useCallback(async (authToken: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/game/${gameId}/storages`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (!response.ok) throw new Error("Error al cargar almacenamiento");
      const storageData = await response.json();
      setStorages(storageData);

      const responseGoal = await fetch(`${BACKEND_URL}/game/${gameId}/goal`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if(!responseGoal.ok) throw new Error("Error al cargar el goal");
      const goalData = await responseGoal.json();
      setAchiveGoal(goalData)

      return storageData;
    } catch (error) {
      console.error(error);
    }
  }, [gameId])

  const fetchActualPlayer = useCallback(async (authToken: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/game/${gameId}/current-player`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (!response.ok) throw new Error("Error al cargar el jugador actual ");
      const currentPlayerData: PlayerDTO = await response.json();
      setCurrentPlayer(currentPlayerData);
      return currentPlayerData
    } catch (error) {
      console.error(error);
    }
  }, [gameId])

  const fetchUserPlayer = useCallback(async (user: number, lobbyId: string, authToken: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/player/user?userId=${user}&lobbyId=${lobbyId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        }
      });
      if (!response.ok) throw new Error("Error al cargar el jugador actual");
      const userPlayerData: PlayerDTO = await response.json();
      setUserPlayer(userPlayerData);
      return userPlayerData
    } catch (error) {
      console.error(error);
    }
  }, [gameId])

  const fetchStoreCards = useCallback(async (authToken: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/game/${gameId}/store-cards`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (!response.ok) throw new Error("Error al cargar las cartas de la tienda");
      const storeCardsData = await response.json();
      setStoreCards(storeCardsData);
    } catch (error) {
      console.error(error);
    }
  }, [gameId])

  const fetchPlayersCards = useCallback(async (userId: number, authToken: string) => {
    console.log(userId)
    try {
      const response = await fetch(`${BACKEND_URL}/game/${gameId}/players-cards?userId=${userId}`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (!response.ok) throw new Error("Error al cargar las cartas del jugador");
      const playerCardsData = await response.json();
      setPlayerCards(playerCardsData);
    } catch (error) {
      console.error(error);
    }
  }, [gameId])

  const fetchMaxDistance = useCallback(async (authToken: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/game/${gameId}/max-range`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (!response.ok) throw new Error("Error al cargar las casillas a las que puede ir el jugador");
      const maxTilesData = await response.json();
      setReachableTiles(maxTilesData);
    } catch (error) {
      console.error(error);
    }
  }, [gameId])

  const fetchActualTile = useCallback(async (authToken: string) => {
    try{
      const response = await fetch(`${BACKEND_URL}/game/${gameId}/current-tile`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if(!response.ok) throw new Error("Error al cargar la casilla actual del jugador");
      const tileData = await response.json();
      setActualTile(tileData);
    }catch(error){
      console.error(error);
    }
  }, [gameId])

  function handleIsMyTurn(userId: string, playerId: string){
    const res = Number(userId) == Number(playerId)
    console.log(res, userId, playerId)
    setIsMyTurn(res)
  }


  useEffect(() => {
    const payload = getTokenPayload();
    const authToken = localStorage.getItem("access_token");
    if (!payload || !authToken) {
      router.push("/login");
      return;
    }
    setToken(authToken)
    async function loadAllGameData(authToken: string) {
      setLoading(true);
      try {
        await getGoal(authToken);
        const players = await fetchPlayers(authToken);
        const freshShips = await fetchShips(authToken);
        const game = await fetchGame(authToken);
        await fetchStorages(authToken);
        const actualPlayer = await fetchActualPlayer(authToken);
        await fetchMaxDistance(authToken);
        await fetchActualTile(authToken);
        await fetchStoreCards(authToken);
        const userPlayer = await fetchUserPlayer(payload?.sub!, game?.lobbyId!, authToken);
        await fetchPlayersCards(payload?.sub!, authToken);
        console.log("Aqui esta el error, useEffect ", userPlayer?.id)
        handleIsMyTurn(userPlayer?.id!, actualPlayer?.id!)
        

        if (players && freshShips) {
          calculatePlayerChips(players, freshShips);
        }
      } catch (error) {
        console.error("Error cargando los datos iniciales de la partida:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAllGameData(authToken);
  }, [gameId]);

  useEffect(() => {
    socket.connect();

    const handleConnect = () => {

      if (gameId && userId) {

        socket.emit('joinGameRoom', {
          gameId,
          userId,
        });
      }
    };

    socket.on('connect', handleConnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.disconnect();
    };
  }, [gameId, userId]);


  useEffect(() => {
    socket.connect();

    socket.on('passedTurn', async () => {
        console.log("entramos en el passedTurn")
        const players = await fetchPlayers(token);
        const freshShips = await fetchShips(token);
        const game = await fetchGame(token);
        await fetchStorages(token);
        const actualPlayer = await fetchActualPlayer(token);
        await fetchMaxDistance(token);
        await fetchActualTile(token);
        await fetchStoreCards(token);
        const userPlayer = await fetchUserPlayer(payload?.sub!, game?.lobbyId!, token);
        await fetchPlayersCards(payload?.sub!, token);
        console.log("aqui esta el error, websocket ", userPlayer?.id)
        handleIsMyTurn(userPlayer?.id!, actualPlayer?.id!)
        
        if (players && freshShips) {
          calculatePlayerChips(players, freshShips);
        }
    })
    socket.on('updateData', async () => {
      const players = await fetchPlayers(token);
      const freshShips = await fetchShips(token);
      await getAdjacentPlayers(false);
      const actualPlayer = await fetchActualPlayer(token);
      await fetchStorages(token);
      await fetchPlayersCards(userId!, token);
      await fetchMaxDistance(token);
      await fetchActualTile(token);
      await fetchGame(token);

      if (players && freshShips) {
        calculatePlayerChips(players, freshShips);
        handleIsMyTurn(userPlayer?.id!, actualPlayer?.id!)
      }
    });

    socket.on('explosionGameOver', async () => {
      setIsGameOverExplosionModalOpen(true)
    });

    socket.on('buyedCard', async () => {
      await fetchShips(token);
      await fetchActualPlayer(token);
      await fetchStorages(token);
      await fetchStoreCards(token);
    });

    socket.on('playedCard', async () => {
      setScannerOptions([])

      getAdjacentPlayers(false);
      await fetchActualPlayer(token);
      await fetchActualTile(token);
      await fetchStorages(token);

      const players = await fetchPlayers(token);
      const ships = await fetchShips(token);

      if (players && ships) {
          calculatePlayerChips(players, ships);
      }

      await fetchMaxDistance(token);
      await fetchPlayersCards(userId!, token);

      

      setIsPlayCardModalOpen(false);
      setIsScannerModalOpen(false);
      setIsSwapCardModalOpen(false);
      setSelectedCardToPlay(null);
    })

    socket.on('endGame', async () => {
      router.push(`/home`);
    })

    socket.on('victoryScreenShow', async() => {
      setIsVictoryModalOpen(true)
    })

    socket.on('youAreDead', async() => {
      setIsGameOverDeathModalOpen(true)
    })

    // Limpias todos al desmontar
    return () => {
        socket.off('passedTurn');
        socket.off('playerMoved');
        socket.off('buyedCard');
        socket.off('playedCard');
        socket.off('endGame');
        socket.off('victoryScreenShow');
        socket.disconnect();
    };
  }, [fetchPlayers, fetchGame, fetchShips, fetchActualPlayer, fetchStorages, fetchPlayersCards, fetchMaxDistance, fetchActualTile]);

  function calculatePlayerChips(playersData: PlayerDTO[], shipsData: ShipDTO[]) {
    const newChips: PlayerChipDTO[] = [];
    const limit = Math.min(playersData.length, shipsData.length);

    for (let i = 0; i < limit; i++) {
      if(!playersData[i].cleanedUp){
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
    }
    setPlayersChips(newChips);
  }

  async function nextPlayer() {
    try {
      socket.emit('finalTurn', {
        playerId: currentPlayer?.id,
        gameId: gameId
      })
      const response = await fetch(`${BACKEND_URL}/game/${gameId}/next-turn`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.defeat) {
        if(result.type === "death"){
          setGameEnded(true)
          setIsGameOverDeathModalOpen(true)
        }else if(result.type === "explote"){
          setGameEnded(true)
          setIsGameOverExplosionModalOpen(true)
        }
      } else {
        const players = await fetchPlayers(token);
        const freshShips = await fetchShips(token);
        await getAdjacentPlayers(false);
        const actualPlayer = await fetchActualPlayer(token);
        await fetchStorages(token);
        await fetchPlayersCards(userId!, token);
        await fetchMaxDistance(token);
        await fetchActualTile(token);
        await fetchGame(token);

        if (players && freshShips) {
          calculatePlayerChips(players, freshShips);
          const userPlayer = await fetchUserPlayer(userId!, game?.lobbyId!, token)
          handleIsMyTurn(userPlayer?.id!, actualPlayer?.id!)
        }

        socket.emit('passingTurn', {
          gameId: gameId,
          type: result.type
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleMovePlayer(targetNodeId: string) {
    try {
      await fetch(`${BACKEND_URL}/game/${gameId}/move-player`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ externalId: targetNodeId }),
      });
      
      const players = await fetchPlayers(token);
      const freshShips = await fetchShips(token);
      await getAdjacentPlayers(false);
      await fetchGame(token);
      await fetchActualPlayer(token);
      await fetchMaxDistance(token);
      await fetchStorages(token);
      await fetchActualTile(token);

      if (players && freshShips) {
        calculatePlayerChips(players, freshShips);
      }
      socket.emit('movingPlayer', {
        gameId: gameId
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function handleUpgradeShip(system:string){
    try{
      await fetch(`${BACKEND_URL}/game/${gameId}/upgrade-ship`,{
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ system: system})
      });
      await fetchShips(token);
      await fetchActualPlayer(token);
      await fetchStorages(token);
    }catch(error){
      console.error(error);
    }
  }

  async function handleChangeMinerals(system: string){
    try{
      await fetch(`${BACKEND_URL}/game/${gameId}/change-minerals`,{
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ system: system})
      });
      await fetchStorages(token);
    }catch(error){
      console.error(error);
    }
  }

  async function handleBuy (cardId: number) {
    try {
      const response = await fetch(`${BACKEND_URL}/game/${gameId}/buy-card`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cardId })
      });
      if (!response.ok) throw new Error("Error");
      await fetchStoreCards(token);
      await fetchStorages(token);
      await fetchPlayersCards(userId!, token);
      socket.emit('buyCard', {
        gameId: gameId
      });
    } catch (error) {
      console.error(error);
    }
  };

  async function handleDrill(){
    try {
      const response = await fetch(`${BACKEND_URL}/game/${gameId}/drill`, {
        method: "PUT", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error("Fallo en los sistemas de perforación");
      
      const data: DrillResponse = await response.json();
      
      if(data.valid){
        setDrillResult(data);
        setIsDrillModalOpen(true);
        await fetchStorages(token);
        await fetchGame(token);
        await fetchShips(token);
        await fetchActualTile(token);
      }
      

    } catch (error) {
      console.error("Error en la perforación:", error);
    }
  }

  async function handleDrillDeeper(){
    try {
      const response = await fetch(`${BACKEND_URL}/game/${gameId}/drill-deeper`, {
        method: "PUT", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error("Fallo en los sistemas de perforación");
      
      const data: DrillResponse = await response.json();
      
      if(data.valid){
        setDrillResult(data);
        setIsDrillModalOpen(true);
        await fetchStorages(token);
        await fetchGame(token);
        await fetchShips(token);
        await fetchActualTile(token);
      }
      

    } catch (error) {
      console.error("Error en la perforación:", error);
    }
  }

  async function handleGetCard(card: CardDTO){
    if(!userPlayer?.isDead && card.playerId && card.playerId===userPlayer?.id){
      setSelectedCardToPlay(card),
      setIsPlayCardModalOpen(true)
    }
  }

  async function getResourcesCardsForEHCard(){
    try{
      const response = await fetch(`${BACKEND_URL}/game/${gameId}/get-resource-cards`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
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
      const response = await fetch(`${BACKEND_URL}/game/${gameId}/adjacent-players`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
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
      await fetch(`${BACKEND_URL}/game/${gameId}/use-card`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify( {cardId: card.id, effect: option} )
      })

      setScannerOptions([])

      getAdjacentPlayers(false);
      await fetchActualPlayer(token);
      await fetchActualTile(token);
      await fetchStorages(token);

      const players = await fetchPlayers(token);
      const ships = await fetchShips(token);

      if (players && ships) {
          calculatePlayerChips(players, ships);
      }

      await fetchMaxDistance(token);
      await fetchPlayersCards(userId!, token);

      

      setIsPlayCardModalOpen(false);
      setIsScannerModalOpen(false);
      setIsSwapCardModalOpen(false);
      setSelectedCardToPlay(null);
      socket.emit('playCard', {
        gameId: gameId
      });
    }catch(error){
      console.error(error)
    }
  }

  async function handleResetGame(){
    setIsGameOverDeathModalOpen(false);
    setIsGameOverExplosionModalOpen(false);
    try{
      const response = await fetch(`${BACKEND_URL}/game/${gameId}/delete-game`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      if(!response.ok) throw new Error("Error al eliminar el juego");
      socket.emit('resetGame', {
        gameId: gameId
      });
      router.push(`/home`);
    }catch(error){
      console.error(error)
    }
  }

  async function handleVictory(){
    setIsVictoryModalOpen(true)
  }

  async function handleInitialHelp(){
    try{
      await fetch(`${BACKEND_URL}/game/${gameId}/initial-help`,{
        method:"PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      await fetchActualPlayer(token);
      await fetchStorages(token);
    }catch(error){
      console.error(error)
    }
  }

  async function handleCloseModal(){
    setIsGameOverDeathModalOpen(false)
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
            {!userPlayer?.isDead && <StoreComponent
              cards={storeCards.slice(0, 3)}
              handleBuy={handleBuy}
              externalId={ships.find((s) => s.id===userPlayer?.shipId)?.externalId!}
              redMinerals={storages.find((s) => s.id === userPlayer?.storageId)?.red!}
              numPlayerCards={playerCards.length}
            />}
          </div>

          {isMyTurn && (!(achiveGoal && actualTile?.externalId === "initial_"+(userPlayer?.turnOrder! + 1))?(<button
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
            onClick={async () => {
              await handleVictory()
              socket.emit('playCard', {
                gameId: gameId
              });
            }}
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
          </button>))}
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
        {isMyTurn && achiveGoal && (
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
            isMyTurn={isMyTurn}
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
            {userPlayer && !userPlayer.isDead &&(
              <PlayerDataComponent
                shipData={ships.find(
                  (s) => s.id === Number(userPlayer.shipId),
                )}
                cargoData={storages.find(
                  (s) => s.id === Number(userPlayer.storageId),
                )}
                cardsData={playerCards}
                actualTile={actualTile??{id:"999",externalId:"externalId", type: TileTypeDTO.EMPTY, positionX: 0, positionY: 0, drillAttempts: 0, gameId: 99} as TileDTO}
                playerMovement={userPlayer.movement}
                initialHelp = {userPlayer.initialHelp}
                adjacentPlayers={adjacentPlayers}
                actualRound={game?.supernovaLvL!}
                handleUpgrade={handleUpgradeShip}
                handleChange={handleChangeMinerals}
                handleDrill={handleDrill}
                handleCard={handleGetCard}
                handleInitialHelp={handleInitialHelp}
                isMyTurn={isMyTurn}
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
      gameEnded={gameEnded}
      handleCloseModal={handleCloseModal}
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
{isVictoryModalOpen && userPlayer && (
  <div>
    <VictoryModal
      currentPlayer={userPlayer}
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