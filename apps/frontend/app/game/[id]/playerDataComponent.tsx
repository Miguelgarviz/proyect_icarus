import React from "react";
import styles from "./styles/playerData.module.css";
import { StorageDTO } from "../../../lib/dto/storageDTO";
import { ShipDTO } from "../../../lib/dto/shipDTO";
import Image from "next/image";
import { CardDTO, CardTypeDTO } from "../../../lib/dto/storeDTO";
import { CARD_DATA } from "./StoreComponent";
import { TileDTO } from "../../../lib/dto/tileDTO";
import { PlayerChipDTO } from "../../../lib/dto/playerDTO";

export default function PlayerDataComponent({
  shipData,
  cargoData,
  cardsData,
  actualTile,
  playerMovement,
  initialHelp,
  adjacentPlayers,
  actualRound,
  handleUpgrade,
  handleChange,
  handleDrill,
  handleCard,
  handleInitialHelp
}: {
  shipData: ShipDTO | undefined;
  cargoData: StorageDTO | undefined;
  cardsData: CardDTO[] | undefined;
  actualTile: TileDTO;
  playerMovement: number;
  initialHelp: boolean;
  adjacentPlayers: PlayerChipDTO[];
  actualRound: number;
  handleUpgrade: (system: string) => void;
  handleChange: (system: string) => void;
  handleDrill: () => void;
  handleCard: (card: CardDTO) => void;
  handleInitialHelp: ()=> void;
}) {
  if (!shipData || !cargoData) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.noDataText}>Sincronizando telemetría...</div>
      </div>
    );
  }

  const isAtSpaceStation =
    shipData.externalId?.includes("space_station") ?? false;

  const drillPrice: Record<string,number> = {
    "GREEN":1,
    "RED":2,
    "YELLOW":3
  }

  function validUseCard(card: CardDTO): boolean{
    switch (card.type.toString()){
      case "TEMPORARY_PATCH":
        return (shipData?.drill ?? 0) < 10 || (shipData?.shield ?? 0)< 10
      case "NEW_DRILL":
        return (shipData?.drill?? 0) < 10
      case "BACKUP_POWER":
        return (shipData?.shield?? 0) < 10
      case "SLINGSHOT":
        return playerMovement >= 2 && adjacentPlayers.length > 0;
      default:
        return true
    }
  }

  const obtenerDesgasteEscudo = (): number => {
    const basePosicion = (actualTile?.positionY ?? 0) + 1;
    let bonoRonda = 0;

    if (actualRound >= 9 && actualRound <= 14) {
      bonoRonda = 1;
    } else if (actualRound > 14 && actualRound <= 19) {
      bonoRonda = 2;
    }

    return basePosicion + bonoRonda;
  };

  const valorDesgaste = obtenerDesgasteEscudo();

  const obtenerCosteTaladro = (): number => {
    if (!shipData.externalId?.includes("planet") || (actualTile?.drillAttempts ?? 0) <= 0) {
      return 0;
    }
    return drillPrice[actualTile.type?.toString()] ?? 0;
  };

  const costeTaladro = obtenerCosteTaladro();
  const mostrarCosteTaladro = costeTaladro > 0 && shipData.drill >= costeTaladro;

  return (
    <div className={styles.dashboardContainer}>
      <h2 className={styles.dashboardTitle}>Datos del Jugador</h2>

      {/* --- BLOQUE 1: SUBSISTEMAS --- */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Estado de la Nave</div>
        <div className={styles.gridRows}>
          <div className={styles.dataRow}>
            <div className={styles.labelWrapper}>
              <div className={styles.iconWrapper}>
                <Image
                  src="/images/icons/engine-icon.png"
                  alt="Motor"
                  fill
                  sizes="22px"
                  style={{ objectFit: "contain" }}
                />
              </div>{" "}
              Motores
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div className={`${styles.valueBadge} ${styles.engineValue}`}>
                {shipData.engine}
              </div>
              {isAtSpaceStation &&
                shipData.engine < 5 &&
                cargoData.red >= 1 &&
                !shipData.upgradedEngine && (
                  <button
                    className={styles.upgradeButton}
                    onClick={() => handleUpgrade("engine")}
                    title="Mejorar Motor"
                  >
                    +
                  </button>
                )}
            </div>
          </div>

          <div className={styles.dataRow}>
            <div className={styles.labelWrapper}>
              <div className={styles.iconWrapper}>
                <Image
                  src="/images/icons/drill-icon.png"
                  alt="Taladro"
                  fill
                  sizes="22px"
                  style={{ objectFit: "contain" }}
                />
              </div>{" "}
              Taladros
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div className={`${styles.valueBadge} ${styles.drillValue}`}>
                {shipData.drill}
              </div>
              
              {/* Indicador dinámico de coste de excavación */}
              {mostrarCosteTaladro && (
                <span 
                  style={{ 
                    color: "#ff8c00", // Color naranja/alerta para diferenciarlo del desgaste del escudo
                    fontWeight: "800", 
                    fontSize: "1.15rem",
                    marginLeft: "4px",
                    textShadow: "0 0 6px rgba(255, 140, 0, 0.5)"
                  }}
                  title="Coste de excavación en este planeta"
                >
                  -{costeTaladro}
                </span>
              )}

              {isAtSpaceStation &&
                shipData.drill < 10 &&
                cargoData.green >= 1 && (
                  <button
                    className={styles.upgradeButton}
                    onClick={() => handleUpgrade("drill")}
                    title="Mejorar Taladro"
                  >
                    +
                  </button>
                )}
            </div>
          </div>

          <div className={styles.dataRow}>
            <div className={styles.labelWrapper}>
              <div className={styles.iconWrapper}>
                <Image
                  src="/images/icons/shield-icon.png"
                  alt="Escudo"
                  fill
                  sizes="22px"
                  style={{ objectFit: "contain" }}
                />
              </div>{" "}
              Escudos
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Valor actual del escudo */}
              <div className={`${styles.valueBadge} ${styles.shieldValue}`}>
                {shipData.shield}
              </div>
              
              {/* Indicador dinámico de pérdida/desgaste */}
              <span 
                style={{ 
                  color: "#ff3b3b", 
                  fontWeight: "800", 
                  fontSize: "1.15rem",
                  marginLeft: "4px",
                  textShadow: "0 0 6px rgba(255, 59, 59, 0.6)"
                }}
              >
                -{valorDesgaste}
              </span>

              {isAtSpaceStation &&
                shipData.shield < 10 &&
                cargoData.green >= 1 && (
                  <button
                    className={styles.upgradeButton}
                    onClick={() => handleUpgrade("shield")}
                    title="Mejorar Escudo"
                  >
                    +
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* --- BLOQUE 2: ALMACÉN DE MINERALES --- */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Almacén de Minerales</div>
        <div className={styles.gridRows}>

          <div className={styles.dataRow}>
            <div className={styles.labelWrapper}>
              {isAtSpaceStation &&
                cargoData.green >= 7 &&
                cargoData.red < 10 && (
                  <button
                    className={styles.changeToRed}
                    onClick={() => handleChange("green-to-red")}
                    title="Cambiar materiales verdes a rojos"
                  >
                    ▼
                  </button>
                )}
              <div className={styles.iconWrapper}>
                <Image
                  src="/images/icons/green-mineral.png"
                  alt="Mineral Verde"
                  fill
                  sizes="22px"
                  style={{ objectFit: "contain" }}
                />
              </div>{" "}
              Mineral Verde
            </div>
            <div className={styles.valueBadge}>{cargoData.green}</div>
            {initialHelp && isAtSpaceStation &&
                shipData.drill === 0 &&
                cargoData.green === 0 && 
                cargoData.red === 0 &&
                cargoData.yellow === 0 &&(<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {(
                  <button
                    className={styles.upgradeButton}
                    onClick={() => handleInitialHelp()}
                    title="Conseguir Ayuda Inicial"
                  >
                    +
                  </button>
                )}
            </div>)}
          </div>

          <div className={styles.dataRow}>
            <div className={styles.labelWrapper}>
              {isAtSpaceStation &&
                cargoData.red >= 1 &&
                cargoData.green < 18 && (
                  <button
                    className={styles.changeToGreen}
                    onClick={() => handleChange("red-to-green")}
                    title="Cambiar materiales rojos a verdes"
                  >
                    ▲
                  </button>
                )}
              <div className={styles.iconWrapper}>
                <Image
                  src="/images/icons/red-mineral.png"
                  alt="Mineral Rojo"
                  fill
                  sizes="22px"
                  style={{ objectFit: "contain" }}
                />
              </div>{" "}
              {isAtSpaceStation &&
                cargoData.red >= 5 &&
                cargoData.yellow < 10 && (
                  <button
                    className={styles.changeToYellow}
                    onClick={() => handleChange("red-to-yellow")}
                    title="Cambiar materiales rojos a amarillos"
                  >
                    ▼
                  </button>
                )}
              Mineral Rojo
            </div>
            <div className={styles.valueBadge}>{cargoData.red}</div>
          </div>

          <div className={styles.dataRow}>
            <div className={styles.labelWrapper}>
              {isAtSpaceStation &&
                cargoData.yellow >= 1 &&
                cargoData.red < 10 && (
                  <button
                    className={styles.changeToRed}
                    onClick={() => handleChange("yellow-to-red")}
                    title="Cambiar materiales amarillos a rojos"
                  >
                    ▲
                  </button>
                )}
              <div className={styles.iconWrapper}>
                <Image
                  src="/images/icons/yellow-mineral.png"
                  alt="Mineral Amarillo"
                  fill
                  sizes="22px"
                  style={{ objectFit: "contain" }}
                />
              </div>{" "}
              Mineral Amarillo
            </div>
            <div className={styles.valueBadge}>{cargoData.yellow}</div>
          </div>
        </div>
      </div>

      {/* --- BLOQUE 3: CARTAS DEL JUGADOR --- */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Cartas del Jugador</div>

        {cardsData?.map((card, index) => (
          <div className={styles.dataRow} key={`card-${index}`}>
            <div className={styles.playerCardName}>
              {CARD_DATA[card.type].name}
            </div>
            {validUseCard(card) && (<button
              style={{
                marginLeft: "10px",
                padding: "6px 12px",
                backgroundColor: "#00FF00",
                color: "#000",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
              onClick={() => handleCard(card)}
            >
              Usar
            </button>)}
          </div>
        ))}

        {Array.from({ length: Math.max(0, 3 - (cardsData?.length ?? 0)) }).map(
          (_, index) => (
            <div className={styles.emptyCardSlot} key={`empty-${index}`}>
              <span className={styles.emptyCardText}>
                Ranura de carta vacía
              </span>
            </div>
          ),
        )}
      </div>
      {shipData.externalId.includes("planet") && actualTile.drillAttempts > 0 && shipData.drill > 0 && shipData.drill >= drillPrice[actualTile.type.toString()] && (
        <button
              style={{
                padding: "6px 12px",
                backgroundColor: "#ff0000",
                color: "#ffffff",
                border: "none",
                borderRadius: "4px",
                fontSize: "0.75rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
              onClick={() => handleDrill()}
      >
        Excavar
      </button>)}
    </div>
  );
}