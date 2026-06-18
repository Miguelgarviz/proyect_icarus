"use client";

import React from 'react';
import Image from 'next/image';
import styles from './styles/store.module.css';
import { CardDTO } from '../../../lib/dto/storeDTO';

export const CARD_DATA: { [key: string]: { img: string, desc: string, name: string } } = {
  'TEMPORARY_PATCH': {
    img: '/images/cards/Temporary_Patch_card.png',
    name: 'Parche Temporal',
    desc: 'Restaura 5 puntos de escudos O de taladros inmediatamente. Descartar luego de usar'
  },
  'BACKUP_POWER': {
    img: '/images/cards/Backup_Power_card.png',
    name: 'Energía de Reserva',
    desc: 'Restaura el estado del escudo al máximo nivel posible. Descartar luego de usar'
  },
  'NEW_DRILL': {
    img: '/images/cards/New_Drill_card.png',
    name: 'Taladro Nuevo',
    desc: 'Restaura el estado del taladro al máximo nivel posible. Descartar luego de usar'
  },
  'SLINGSHOT': {
    img: '/images/cards/Slingshot_card.png',
    name: 'Teletransporte',
    desc: 'Cambia la posición de tu ficha con la de un jugador adjacente. Obtienes 2 de movimiento. Descartar luego de usar'
  },
  'ENHANCED_SCANNER': {
    img: '/images/cards/Enhanced_Scanner_card.png',
    name: 'Escaner Mejorado',
    desc: 'Roba 3 cartas de recursos y escoje una. Descartar luego de usar'
  },
  'ROCKET_THRUSTERS': {
    img: '/images/cards/Rocket_Thrusters_cards.png',
    name: 'Impulso de los motores',
    desc: 'Obten un movimiento gratis. Descartar luego de usar'
  }
};

export default function StoreComponent({ cards, handleBuy, externalId, redMinerals, numPlayerCards }: { cards: CardDTO[], handleBuy: (cardId: number) => void, externalId: string, redMinerals: number, numPlayerCards: number }) {


  return (
    <div className={styles.storeContainer}>
      <h2 className={styles.storeTitle}>Tienda de Cartas</h2>
      
      {!cards || cards.length === 0 ? (
        <div className={styles.outOfStockContainer}>
          <span className={styles.outOfStockText}>Suministros agotados en este cuadrante</span>
        </div>
      ) : (
        <div className={styles.cardsGrid}>
          {cards.map((card) => {
            if (!card || !card.type || !CARD_DATA[card.type]) return null;

            return (
              <div className={styles.storeCard} key={card.id}>
                
                <div className={styles.cardImageWrapper}>
                  <Image 
                    src={CARD_DATA[card.type].img} 
                    alt={CARD_DATA[card.type].name} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }} 
                  />
                </div>

                <h3 className={styles.cardName}>{CARD_DATA[card.type].name}</h3>
                <p className={styles.cardDescription}>{CARD_DATA[card.type].desc}</p>

                <div className={styles.buySection}>
                  <div className={styles.priceDisplay}>
                    {card.cost} 
                    <div className={styles.mineralIconWrapper}>
                      <Image 
                        src="/images/icons/red-mineral.png"
                        alt="Mineral Rojo" 
                        fill 
                        sizes="20px" 
                        style={{ objectFit: 'contain' }} 
                      />
                    </div> 
                  </div>

                  {externalId.includes("space_station") && redMinerals >= card.cost && numPlayerCards < 3 && (
                    <button 
                      onClick={() => handleBuy(Number(card.id))}
                      className={styles.buyButton}
                    >
                      COMPRAR
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}