import React from 'react';
import styles from './game.module.css';
import { StorageDTO } from '../../../lib/dto/storageDTO';
import { ShipDTO } from '../../../lib/dto/shipDTO';
import Image from 'next/image';
import { CardDTO } from '../../../lib/dto/storeDTO';

// Estructura de datos que espera recibir el componente


export default function PlayerDataComponent({ shipData, cargoData, cardsData }: {shipData: ShipDTO | undefined , cargoData: StorageDTO | undefined, cardsData: CardDTO[] | undefined}) {
  console.log("PlayerDataComponent - Ship Data:", cargoData?.green);
  // Si los datos aún no se han cargado del backend, evitamos que rompa mostrando un loader
  if (!shipData || !cargoData) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.noDataText}>Sincronizando telemetría...</div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <h2 className={styles.dashboardTitle}>Datos del Jugador</h2>

      {/* --- BLOQUE 1: SUBSISTEMAS --- */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Estado de la Nave</div>
        <div className={styles.gridRows}>
          
          {/* Nivel del Motor */}
          <div className={styles.dataRow}>
            <div className={styles.labelWrapper}>
              <div className={styles.iconWrapper}>
                <Image 
                  src="/images/icons/engine-icon.png"
                  alt="Motor" 
                  fill 
                  sizes="22px" 
                  style={{ objectFit: 'contain' }} />
              </div> Motor
            </div>
            <div className={`${styles.valueBadge} styles.engineValue`}>
              {shipData.engine}
            </div>
          </div>

          {/* Nivel del Taladro */}
          <div className={styles.dataRow}>
            <div className={styles.labelWrapper}>
              <div className={styles.iconWrapper}>
                <Image 
                  src="/images/icons/drill-icon.png"
                  alt="Taladro" 
                  fill 
                  sizes="22px" 
                  style={{ objectFit: 'contain' }} />
              </div> Taladro
            </div>
            <div className={`${styles.valueBadge} styles.drillValue`}>
              {shipData.drill}
            </div>
          </div>

          {/* Nivel del Escudo */}
          <div className={styles.dataRow}>
            <div className={styles.labelWrapper}>
              <div className={styles.iconWrapper}>
                <Image 
                  src="/images/icons/shield-icon.png"
                  alt="Escudo" 
                  fill 
                  sizes="22px" 
                  style={{ objectFit: 'contain' }} />
              </div> Escudo
            </div>
            <div className={`${styles.valueBadge} styles.shieldValue`}>
              {shipData.shield}
            </div>
          </div>

        </div>
      </div>

      {/* --- BLOQUE 2: ALMACÉN DE MINERALES --- */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Almacén de Minerales</div>
        <div className={styles.gridRows}>
          
          {/* Mineral Verde */}
          <div className={styles.dataRow}>
            <div className={styles.labelWrapper}>
              <div className={styles.iconWrapper}>
                <Image 
                  src="/images/icons/green-mineral.png"
                  alt="Mineral Verde" 
                  fill 
                  sizes="22px" 
                  style={{ objectFit: 'contain' }} />
              </div> Mineral Verde
            </div>
            <div className={styles.valueBadge}>
              {cargoData.green}
            </div>
          </div>

          {/* Mineral Rojo */}
          <div className={styles.dataRow}>
            <div className={styles.labelWrapper}>
              <div className={styles.iconWrapper}>
                <Image 
                  src="/images/icons/red-mineral.png"
                  alt="Mineral Rojo" 
                  fill 
                  sizes="22px" 
                  style={{ objectFit: 'contain' }} />
              </div> Mineral Rojo
            </div>
            <div className={styles.valueBadge}>
              {cargoData.red}
            </div>
          </div>

          {/* Mineral Amarillo */}
          <div className={styles.dataRow}>
            <div className={styles.labelWrapper}>
              <div className={styles.iconWrapper}>
                <Image 
                  src="/images/icons/yellow-mineral.png"
                  alt="Mineral Amarillo" 
                  fill 
                  sizes="22px" 
                  style={{ objectFit: 'contain' }} />
              </div> Mineral Amarillo
            </div>
            <div className={styles.valueBadge}>
              {cargoData.yellow}
            </div>
          </div>

        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Cartas del Jugador</div>
          {cardsData?.map((card, index) => (
            <div className={styles.dataRow} key={index}>
              <div className={styles.playerCardName}>
                {card.type.toString().replace("_", ' ')}
              </div>
              <button 
                style={{ 
                  marginLeft: '10px',
                  padding: '6px 12px',
                  backgroundColor: '#00FF00',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
                  onClick={() => alert(`Usando carta: ${card.type}`)}
                >
                Usar
              </button>
            </div>
          ))}
          {cardsData?.length === 0 && (
            <div className={styles.noDataText}>No tienes cartas en tu poder.</div>
          )}
        </div>
    </div>
  );
}