"use client";

import React from 'react';
import Image from 'next/image';
import styles from './game.module.css';
import { CardDTO } from '../../../lib/dto/storeDTO';

export const CARD_DATA: { [key: string]: { img: string, desc: string, name: string } } = {
  'TEMPORARY_PATCH': {
    img: '/images/cards/Temporary_Patch_card.png',
    name: 'Parche Temporal',
    desc: 'Restaura 5 puntos de escudo O de escudos inmediatamente. Descartar luego de usar'
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      color: 'white',
      padding: '10px'
    }}>
      <h2 style={{
        textAlign: 'center',
        textTransform: 'uppercase',
        fontSize: '1.3rem',
        margin: '10px 0 20px 0',
        color: '#FFD700',
        textShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
      }}>
        Tienda Estelar
      </h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        overflowY: 'auto',
        flex: 1,
        paddingBottom: '20px'
      }}>
        {cards.map((card) => {
          const data = CARD_DATA[card.type] || CARD_DATA['DEFAULT'];

          return (
            <div key={card.id} style={{
              width: '100%',
              backgroundColor: 'rgba(20, 20, 20, 0.9)',
              border: '2px solid #FFD700',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
            }}>
              
              <div style={{ 
                position: 'relative', 
                width: '100%', 
                height: '140px', 
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderBottom: '1px solid rgba(255, 215, 0, 0.3)'
              }}>
                <Image 
                  src={data.img} 
                  alt={String(card.type)} 
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  style={{ objectFit: 'contain', padding: '10px' }} 
                />
              </div>

              <div style={{ padding: '12px', flex: 1 }}>
                <div style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: 'bold', 
                  color: '#FFD700',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  textAlign: 'center'
                }}>
                  {data.name}
                </div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#ddd', 
                  lineHeight: '1.4',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  {data.desc}
                </div>
              </div>

              <div style={{ 
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 215, 0, 0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(255, 215, 0, 0.1)'
              }}>
                <div style={{ 
                  fontSize: '1.2rem', 
                  color: '#ff0000', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  {card.cost} 
                  <div className={styles.iconWrapper}>
                    <Image 
                      src="/images/icons/red-mineral.png"
                      alt="Mineral Rojo" 
                      fill 
                      sizes="22px" 
                      style={{ objectFit: 'contain' }} />
                  </div> 
                </div>

                {externalId.includes("space_station") && redMinerals>=card.cost && numPlayerCards<3 && <button 
                  onClick={() => handleBuy(Number(card.id))}
                  style={{
                    backgroundColor: '#FFD700',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFD700'}
                >
                  COMPRAR
                </button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}