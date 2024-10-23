export interface Partida {
  id: string; // ID generado automáticamente
  codigo?: string; // Código único de la partida
  jugadores: Jugador[]; // Lista de jugadores en la partida
  fondoApuestaFijo: number; // Fondo de apuesta fijo
  fichasTotales: number; // Fichas totales que tendra cada jugador
  tablerosize: number; // Tamaño del tablero
  creadorNombre: string; // Nombre del creador de la partida
  colores: string[]; // Colores asignados a los jugadores
  montoApuesta: number; // Apuesta actual
  turnoActual?: number; // Turno actual, opcional con valor por defecto 0
  estado?: estadoEnum; // Estado de la partida, opcional con valor por defecto 'EN_ESPERA'
  tablero?: Tablero; // Tablero de la partida, opcional
}

export interface Jugador {
  id: number; // ID incremental
  nombre: string; // Nombre del jugador
  fondoApuesta?: number; // Fondo de apuesta del jugador, opcional
  haPerdido: boolean; // Si el jugador ha perdido
  color?: string; // Color del jugador, opcional
  turnoFicha: number; // Turno actual de la ficha del jugador
  fichas: Ficha[]; // Lista de fichas del jugador
}

export interface Tablero {
  tableroSize: number; // Número de casillas por aspa
  casillas: Casilla[]; // Lista de casillas en el tablero
}

export interface Casilla {
  id: string; // ID generado automáticamente
  tipo: CasillaTypeEnum; // Tipo de la casilla
  orientacion: OrientacionCasilla; // Orientación de la casilla
  posicion: Coordenadas; // Coordenadas de la casilla en el tablero
  ocupante?: Ficha | null; // ficha ocupante, opcional
}
export interface Ficha {
  id: number; // ID incremental
  color?: string; // Color de la ficha, opcional
  posicion?: Coordenadas; // Coordenadas en el tablero, opcional
  eliminada?: boolean; // Si la ficha está eliminada, opcional con valor por defecto 'false'
  casillasAvanzadas: number; // Casillas avanzadas por la ficha
}

export interface Coordenadas {
  X: number; // Coordenada X
  Y: number; // Coordenada Y
}

export enum CasillaTypeEnum {
  OCULTA = 'OCULTA',
  NORMAL = 'NORMAL',
  CENTRAL = 'CENTRAL',
  TRIANGULO = 'TRIANGULO',
  SEMICIRCULAR = 'SEMICIRCULAR',
  INICIO = 'INICIO',
  FINAL = 'FINAL',
  SALIDA = 'SALIDA',
}

export enum OrientacionCasilla {
  SuperiorIzquierda = 'SuperiorIzquierda',
  SuperiorDerecha = 'SuperiorDerecha',
  InferiorIzquierda = 'InferiorIzquierda',
  InferiorDerecha = 'InferiorDerecha',
  IzquierdaSuperior = 'IzquierdaSuperior',
  IzquierdaInferior = 'IzquierdaInferior',
  DerechaSuperior = 'DerechaSuperior',
  DerechaInferior = 'DerechaInferior',
}

export enum estadoEnum {
  EN_ESPERA = 'EN_ESPERA',
  EN_CURSO = 'EN_CURSO',
  FINALIZADA = 'FINALIZADA',
}
