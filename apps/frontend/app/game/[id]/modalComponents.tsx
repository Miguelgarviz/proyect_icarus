import styles from './styles/modal.module.css'
import { DrillCardDTO } from '../../../lib/dto/drillCardDTO';
import { PlayerChipDTO, PlayerDTO } from '../../../lib/dto/playerDTO';
import { CardDTO, CardTypeDTO } from '../../../lib/dto/storeDTO';
import { CARD_DATA } from "./StoreComponent";
import Image from "next/image";
import { PLAYER_IMAGES } from './EntitiesLayer';

interface DrillResponse {
  empty: boolean;
  valid: boolean;
  type: "green" | "red" | "yellow" | "supernova" | "";

  drillCard?: DrillCardDTO; 
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

export function DrillModal({
    drillResult,
    drillDeeper,
    setDrillDeeper,
    setDrillResult,
    setIsDrillModalOpen,
    handleDrillDeeper
}:{
    drillResult: DrillResponse;
    drillDeeper: boolean;
    setDrillDeeper: (result: boolean)=>void;
    setIsDrillModalOpen: (result: boolean) => void;
    setDrillResult:(result: DrillResponse| null)=> void;
    handleDrillDeeper: ()=>void;
}){
    return (
        <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      
      <h3 className={styles.modalTitle}>Resultado de la excavación</h3>
      
      <div className={styles.modalBody}>
        
        {drillResult.empty && (
          <div className={[styles.resultBoxBase, styles.resultEmpty].join(' ')}>
            <div className={styles.resultIcon}>🌌</div>
            <h4>Excavación sin resultados</h4>
            <p className={styles.resultDescription}>
              Los escáneres térmicos confirman que el núcleo de este sector está completamente agotado.
            </p>
          </div>
        )}

        {drillResult.drillCard && drillResult.drillCard.isSupernovaCard && !drillResult.empty && (
          <div className={[styles.resultBoxBase, styles.resultSupernova].join(' ')}>
            <div className={styles.resultIcon}>💥</div>
            <h4>¡Alerta de Supernova!</h4>
            <p className={styles.resultDescription}>
              La perforación ha desestabilizado el núcleo cuántico provocando una descarga crítica.
            </p>
          </div>
        )}

        {drillResult.drillCard && !drillResult.drillCard.isSupernovaCard && !drillResult.empty && (
          <div className={[styles.resultBoxBase, styles.resultCard].join(' ')}>
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
    )
}

export function DeathEndModal(
  {handleResetGame}
  :
  {handleResetGame: ()=>void}
){
  return(
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
  )
}

export function SuperNovaEndModal(
  {handleResetGame}
  :
  {handleResetGame: () => void}
){
  return(
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
  )
}

export function VictoryModal(
  {
    currentPlayer,
    handleResetGame
  }:
  {
    currentPlayer: PlayerDTO
    handleResetGame: ()=> void
  }
){
  return(
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
  )
}

export function NormalCardModal(
  {
    selectedCardToPlay,
    getAdjacentPlayers,
    getResourcesCardsForEHCard,
    handlePlayCardEffect,
    setIsPlayCardModalOpen,
    setSelectedCardToPlay
  }
  :
  {
    selectedCardToPlay : CardDTO;
    getAdjacentPlayers: (result: boolean) => void;
    getResourcesCardsForEHCard: () => void;
    handlePlayCardEffect: (card: CardDTO, option: string) => void;
    setIsPlayCardModalOpen: (result: boolean) => void;
    setSelectedCardToPlay: (result: CardDTO | null) => void;
  }
){
  return(
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
            className={`${styles.actionButton} ${styles.btnDrill}`}
            onClick={() => handlePlayCardEffect(selectedCardToPlay, "new_drill")}
          >
            ⚡ Calibrar Taladro al Máximo
          </button>
        )}

        {selectedCardToPlay.type.toString() === "BACKUP_POWER" && (
          <button 
            className={`${styles.actionButton} ${styles.btnShield}`}
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
  )
}

export function ScannerCardModal(
  {
    scannerOptions,
    handlePlayCardEffect,
    selectedCardToPlay,
  }
  :
  {
    scannerOptions: DrillCardDTO[];
    handlePlayCardEffect: (card: CardDTO, option: string) => void;
    selectedCardToPlay: CardDTO
  }
){
  return(
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
              onClick={() => handlePlayCardEffect(selectedCardToPlay, "resource-card_"+card.id.toString())}
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
  )
}

export function SwapCardModal(
  {
    adjacentPlayers,
    selectedCardToPlay,
    handlePlayCardEffect,
    setIsSwapCardModalOpen,
    setSelectedCardToPlay
  }
  :
  {
    adjacentPlayers: PlayerChipDTO[];
    selectedCardToPlay: CardDTO;
    handlePlayCardEffect: (card: CardDTO, option: string) => void;
    setIsSwapCardModalOpen: (result: boolean) => void;
    setSelectedCardToPlay: (result: CardDTO | null) => void;
  }
){
  return(
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
            onClick={() => handlePlayCardEffect(selectedCardToPlay, "swap-player_" + player.id.toString())}
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
  )
}

export function GoalModal(
  {
    goalImageUrl,
    setIsGoalModalOpen,

  }
  :
  {
    goalImageUrl: string;
    setIsGoalModalOpen: (result:boolean) => void;
  }
){
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
  return(
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
  )
}