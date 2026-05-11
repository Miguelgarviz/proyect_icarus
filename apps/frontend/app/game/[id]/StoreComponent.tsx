import React from 'react';
import { CardDTO } from '../../../lib/dto/storeDTO';



export default function StoreComponent({ cards, gameId }: {cards:CardDTO[], gameId: number}) {
  
  const handleBuy = async (cardId: number) => {
    try {
      console.log(`Intentando comprar la carta: ${cardId}`);
      
      // Ejemplo de fetch con await para la compra
      const response = await fetch(`http://localhost:4000/api/v1/game/${gameId}/buy-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId })
      });

      if (!response.ok) throw new Error("Error en la compra");
      
      alert("¡Carta comprada con éxito!");
    } catch (error) {
      console.error("Error al comprar:", error);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      color: 'white',
      fontFamily: 'sans-serif',
      padding: '10px 0' // Un poco de padding arriba/abajo
    }}>
      {/* Título de la Tienda */}
      <h2 style={{
        textAlign: 'center',
        textTransform: 'uppercase',
        fontSize: '1.2rem',
        margin: '10px 0',
        color: '#FFD700',
        letterSpacing: '2px'
      }}>
        Tienda Estelar
      </h2>

      {/* --- CONTENEDOR DE CARTAS ACTUALIZADO --- */}
      <div style={{
        display: 'flex',
        flexDirection: 'column', // CAMBIO CLAVE: De horizontal a vertical
        justifyContent: 'center', // Centra las cartas verticalmente si hay espacio de sobra
        alignItems: 'center', // Centra las cartas horizontalmente
        flex: 1,
        gap: '15px', // Espacio fijo entre cartas en vez de space-around
        padding: '10px 0'
      }}>
        {cards.map((card) => (
          <div key={card.id} style={{
            // Ajustamos el tamaño para que se vea mejor en vertical
            width: '240px', // Más ancha
            height: '90px', // Menos alta
            border: '2px solid #FFD700',
            borderRadius: '6px',
            display: 'flex',
            // --- NUEVO LAYOUT INTERNO DE CARTA (Row) ---
            flexDirection: 'row', // Nombre a la izq, precio y botón a la der
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 15px',
            backgroundColor: 'rgba(255, 215, 0, 0.05)',
            boxSizing: 'border-box'
          }}>
            {/* 1. Nombre de la Carta (con formato mejorado) */}
            <div style={{ 
              fontSize: '0.85rem', 
              fontWeight: 'bold', 
              color: 'white',
              flex: 1, // Ocupa el espacio de la izquierda
              marginRight: '10px',
              textTransform: 'capitalize' // Pone primera letra en mayus
            }}>
              {/* Usamos el nombre bonito si existe, si no, el de DB */}
              {String(card.type).replace('_', ' ')}
            </div>
            
            {/* 2. Grupo de Precio y Botón (a la derecha) */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-end', // Alinea precio y botón a la dcha
              gap: '8px'
            }}>
              {/* Precio */}
              <div style={{ 
                fontSize: '1rem', 
                color: '#00FF00', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                {card.cost} <span>💎</span>
              </div>

              {/* Botón Comprar */}
              <button 
                onClick={() => handleBuy(Number(card.id))}
                style={{
                  backgroundColor: '#FFD700',
                  color: 'black',
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap' // Evita que el texto se rompa
                }}
              >
                COMPRAR
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}