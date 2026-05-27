"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import BoardGrid from './BoardGrid';
import EntitiesLayer from './EntitiesLayer';
import styles from './game.module.css';
import { useParams } from 'next/navigation';
import { PlayerDTO, PlayerChip } from '../../../lib/dto/playerDTO';
import { ShipDTO } from '../../../lib/dto/shipDTO';
import { CardDTO, StoreDTO } from '../../../lib/dto/storeDTO';
import StoreComponent from './StoreComponent';

export default function GamePage() {
  const params = useParams();
  const [players, setPlayers] = useState<PlayerDTO[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerDTO>();
  const [ships, setShips] = useState<ShipDTO[]>([]);
  const [playersChips, setPlayersChips] = useState<PlayerChip[]>([]);
  const [storeCards, setStoreCards] = useState<CardDTO[]>([]);
  const [store, setStore] = useState<StoreDTO>();
  const gameId = params.id;

  const handleNodeClick = (id: string) => {
    console.log("Has pulsado en:", id);
  };

  useEffect(() => {
    fetchPlayers();
    fetchStore();
  }, [gameId]);

  const fetchPlayers = async () => {
    try {
      const playersResponse = await fetch(`http://localhost:4000/api/v1/game/${gameId}/players`);
      if (!playersResponse.ok) throw new Error('Error al cargar jugadores');
      const playersData = await playersResponse.json();
      await setPlayers(playersData);
      setCurrentPlayer(playersData[0]);
      const shipsResponse = await fetch(`http://localhost:4000/api/v1/game/${gameId}/ships`);
      if (!shipsResponse.ok) throw new Error('Error al cargar naves');
      const shipsData = await shipsResponse.json();
      await setShips(shipsData);

      const newChips: PlayerChip[] = [];
      const count = Math.min(playersData.length, shipsData.length);
      
      for (let i = 0; i < count; i++) {
        newChips.push({
          id: playersData[i].id,
          color: playersData[i].color,
          coordX: shipsData[i].positionX,
          coordY: shipsData[i].positionY,
          externalId: shipsData[i].externalId
        });
      }
      setPlayersChips(newChips);
    } catch (error) {
      console.error(error);
    }
  };

  const nextPlayer = () => {
    if (players.length === 0) return;
    const currentIndex = players.findIndex(p => p.id === currentPlayer?.id);
    const nextIndex = (currentIndex + 1) % players.length;
    setCurrentPlayer(players[nextIndex]);
  }

  function seededRandom(seed: number) {
    return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
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
      const storeResponse = await fetch(`http://localhost:4000/api/v1/game/${gameId}/store`);
      if (!storeResponse.ok) throw new Error('Error al cargar la tienda de la partida');
      const storeData = await storeResponse.json();
      await setStore(storeData);

      const storeCardsResponse = await fetch(`http://localhost:4000/api/v1/store/${storeData.id}/cards`);
      if (!storeCardsResponse.ok) throw new Error('Error al cargar las cartas de la tienda');
      const storeCardsData = await storeCardsResponse.json();

      const randomCards = shuffleArray(storeCardsData, Number(gameId));
      setStoreCards(randomCards);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main className={styles.pageContainer} style={{ 
      height: '100vh', 
      overflow: 'hidden',
      backgroundColor: '#0a0c10' // Asegura un fondo oscuro uniforme si queda espacio
    }}>
      {/* Contenedor principal limitado a la altura de la pantalla (Viewport) */}
      <div style={{ 
        display: 'flex', 
        width: '100%', 
        maxWidth: '1800px', 
        height: '100vh', // Limita la altura total al 100% de la ventana
        margin: '0 auto', 
        gap: '20px', 
        alignItems: 'stretch',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        
        {/* COLUMNA IZQUIERDA */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '15px', // Cambiado a gap para mejor distribución reactiva
          width: '320px',
          flexShrink: 0
        }}>
          {/* Recuadro Azul/Morado */}
          <div className={styles.turnContainer}>
  {currentPlayer ? (
    <>
      {/* 1. Indicador LED con la variable de color inyectada dinámicamente */}
      <div 
        className={styles.turnLed} 
        style={{ '--player-color': currentPlayer.color || '#ffffff' } as React.CSSProperties} 
      />

      {/* 2. Textos del Turno */}
      <div className={styles.turnTextWrapper}>
        <span className={styles.turnLabel}>
          Turno Actual
        </span>
        <span className={styles.turnPlayerName}>
          {currentPlayer.name}
        </span>
      </div>
    </>
  ) : (
    <span className={styles.turnLoading}>
      Esperando jugadores...
    </span>
  )}
</div>

          {/* Recuadro Amarillo (Tienda) */}
          <div style={{ 
            border: '3px solid #FFD700', 
            flex: 1, // Ahora crece dinámicamente según el alto disponible
            minHeight: 0, // Truco de flexbox para permitir que el contenedor interno haga scroll si es necesario
            borderRadius: '8px',
            backgroundColor: 'rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            <StoreComponent cards={storeCards.slice(0,3)} gameId={Number(gameId)}/>
          </div>

          {/* Botón Verde */}
          <button 
            onClick={() => nextPlayer()}
            style={{ 
              border: '3px solid #00FF00', 
              height: '65px', 
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              color: '#00FF00',
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'uppercase',
              flexShrink: 0
            }}
          >
            Pasar Turno
          </button>
        </div>

        {/* TABLERO CENTRAL (Ajustado dinámicamente) */}
        <div className={styles.boardWrapper} style={{ 
          flex: 1, 
          position: 'relative',
          height: '100%', // Obliga al contenedor a usar el espacio vertical asignado
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Image 
            src="/images/tablero.png" 
            alt="Project Icarus" 
            fill 
            priority
            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 80vw, 1200px"
            style={{ objectFit: 'contain' }} // Evita que la imagen se deforme o se salga de su contenedor
          />

          <svg 
            viewBox="0 0 1790 1787" 
            className={styles.svgOverlay}
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              maxHeight: '100%' // Asegura que el SVG siga las mismas reglas restrictivas de la imagen
            }}
          >
            <BoardGrid onNodeClick={handleNodeClick} />
            <EntitiesLayer playersData={playersChips} />
          </svg>
        </div>

        {/* COLUMNA DERECHA */}
        <div style={{ width: '320px', flexShrink: 0 }}>
          <div style={{ 
            border: '3px solid #FF0000', 
            height: '100%', 
            borderRadius: '8px',
            backgroundColor: 'rgba(0,0,0,0.3)' 
          }}>
            {/* Contenido para el cuadro rojo */}
          </div>
        </div>

      </div>
    </main>
  );
}