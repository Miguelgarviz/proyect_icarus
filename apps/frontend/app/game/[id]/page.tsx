// apps/frontend/app/game/page.tsx
"use client";

import Image from 'next/image';
import BoardGrid from './BoardGrid'; // Importamos el componente
import styles from './game.module.css';

export default function GamePage() {
  
  const handleInteraction = (id: string) => {
    console.log("Acción en el nodo:", id);
    // Aquí conectarás con NestJS más adelante
  };

  return (
    <main className={styles.pageContainer}>
      <div className={styles.boardWrapper}>
        <Image 
          src="/images/tablero.png" 
          alt="Project Icarus" 
          fill 
          priority
          sizes="(max-width: 768px) 90vw, (max-width: 1200px) 80vw, 1000px"
          style={{ objectFit: 'contain' }}
        />

        {/* Llamamos al componente externo */}
        <BoardGrid onNodeClick={handleInteraction} />
      </div>
    </main>
  );
}