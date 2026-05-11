"use client";

import { useState, useEffect } from 'react'; // Añadimos hooks
import Image from 'next/image';
import BoardGrid from './BoardGrid';
import EntitiesLayer from './EntitiesLayer';
import styles from './game.module.css';
import { useParams } from 'next/navigation'; // Para obtener el ID del juego de la URL
import { PlayerDTO, PlayerChip } from '../../../lib/dto/playerDTO';
import { ShipDTO } from '../../../lib/dto/shipDTO';
import { CardDTO, StoreDTO } from '../../../lib/dto/storeDTO';
import StoreComponent from './StoreComponent';

export default function GamePage() {
  // 1. Definimos el estado de los jugadores (empezamos con un array vacío)
  const params = useParams();
  const [players, setPlayers] = useState<PlayerDTO[]>([]);
  const [ships, setShips] = useState<ShipDTO[]>([]);
  const [playersChips, setPlayersChips] = useState<PlayerChip[]>([]);
  const [storeCards, setStoreCards] = useState<CardDTO[]>([]);
  const [store, setStore] = useState<StoreDTO>();
  const gameId = params.id;

  // 2. Función para manejar el clic (antes llamada handleNodeClick/handleInteraction)
  const handleNodeClick = (id: string) => {
    console.log("Has pulsado en:", id);
    // Aquí es donde harás el fetch a NestJS para mover al jugador
  };

  // 3. (Opcional por ahora) Cargar jugadores iniciales de la DB
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

        const shipsResponse = await fetch(`http://localhost:4000/api/v1/game/${gameId}/ships`);
        if (!shipsResponse.ok) throw new Error('Error al cargar naves');
        const shipsData = await shipsResponse.json();
        await setShips(shipsData);

        const newChips: PlayerChip[] = [];
      
      // Usamos el mínimo común para evitar errores de índice si un array es más corto
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
      
      // Asumo que tienes un setPlayersChips para guardar esto
        setPlayersChips(newChips);
      } catch (error) {
        console.error(error);
      }
    };
  
    const shuffleArray = (array: CardDTO[]) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    const fetchStore = async () =>{
      try{
        const storeResponse = await fetch(`http://localhost:4000/api/v1/game/${gameId}/store`);
        if (!storeResponse.ok) throw new Error('Error al cargar la tienda de la partida');
        const storeData = await storeResponse.json();
        await setStore(storeData);

        const storeCardsResponse = await fetch(`http://localhost:4000/api/v1/store/${storeData.id}/cards`);
        if (!storeCardsResponse.ok) throw new Error('Error al cargar las cartas de la tienda');
        const storeCardsData = await storeCardsResponse.json();

        const randomCards = shuffleArray(storeCardsData);
        setStoreCards(randomCards);
        
      }catch (error){
        console.error(error);
      }
    }

    console.log(playersChips)
  return (
    <main className={styles.pageContainer}>
      {/* Contenedor principal con Flexbox para alinear las columnas */}
      <div style={{ 
        display: 'flex', 
        width: '100%', 
        maxWidth: '1800px', 
        margin: '0 auto', 
        gap: '20px', 
        alignItems: 'stretch',
        padding: '20px' 
      }}>
        
        {/* COLUMNA IZQUIERDA (Amarillo y Verde) */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          width: '300px' 
        }}>
          {/* Recuadro Amarillo */}
          <div style={{ 
            border: '3px solid #FFD700', 
            height: '800px', 
            borderRadius: '8px',
            backgroundColor: 'rgba(0,0,0,0.3)' 
          }}>
            <StoreComponent cards={storeCards.slice(0,3)} gameId={Number(gameId)}/>
          </div>

          {/* Botón Verde (Posición del cuadro verde) */}
          <button 
            onClick={() => console.log("Acción ejecutada")}
            style={{ 
              border: '3px solid #00FF00', 
              height: '80px', 
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              color: '#00FF00',
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            Confirmar Acción
          </button>
        </div>

        {/* TABLERO CENTRAL */}
        <div className={styles.boardWrapper} style={{ flex: 1 }}>
          <Image 
            src="/images/tablero.png" 
            alt="Project Icarus" 
            fill 
            priority
            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 80vw, 1000px"
            style={{ objectFit: 'contain' }}
          />

          <svg 
            viewBox="0 0 1790 1787" 
            className={styles.svgOverlay}
            xmlns="http://www.w3.org/2000/svg"
          >
            <BoardGrid onNodeClick={handleNodeClick} />
            <EntitiesLayer playersData={playersChips} />
          </svg>
        </div>

        {/* COLUMNA DERECHA (Recuadro Rojo) */}
        <div style={{ width: '300px' }}>
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