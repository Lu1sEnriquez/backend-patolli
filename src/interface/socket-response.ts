export interface SocketResponse<T> {
  success: boolean; // Si la operación fue exitosa o no
  message: string; // Un mensaje informativo o de error
  data?: T | null; // Los datos que se devuelven (solo si success es true)
  code: number; // Código numérico para manejar el estado de la operación
}

// src/socketEvents.d.ts

// Enumeración de eventos de Socket
export enum SocketEvents {
  CREAR_PARTIDA = 'crear_partida',
  PARTIDA_CREADA = 'partida_creada',
  UNIRSE_PARTIDA = 'unirse_partida',
  JUGADOR_UNIDO = 'jugador_unido',
  SEND_MESSAGE = 'send_message',
  RECEIVE_MESSAGE = 'receive_message',
  OBTENER_PARTIDA = 'obtener_partida',
  ELIMINAR_JUGADOR = 'eliminar_jugador',
  ACTUALIZAR_PARTIDA = 'actualizar_partida',
  DISCONNECT = 'disconnect',
  JUGADOR_DESCONECTADO = 'jugador_desconectado',
  PAGAR_APUESTA = 'pagar_apuesta',
}

// Función para 200 OK
export function ok<T>(
  data: T,
  message: string = 'Operación exitosa',
): SocketResponse<T> {
  return {
    success: true,
    message,
    data,
    code: 200,
  };
}

// Función para 201 Created
export function created<T>(
  data: T,
  message: string = 'Recurso creado exitosamente',
): SocketResponse<T> {
  return {
    success: true,
    message,
    data,
    code: 201,
  };
}

// Función para 204 No Content
export function noContent(
  message: string = 'Sin contenido',
): SocketResponse<null> {
  return {
    success: true,
    message,
    data: null,
    code: 204,
  };
}
// Función para 204 No Content
export function deleted<T>(
  message: string = 'Eliminado',
  data: T,
): SocketResponse<T> {
  return {
    success: true,
    message,
    data: data,
    code: 210,
  };
}
// Función para 400 Bad Request
export function badRequest(
  message: string = 'Solicitud incorrecta',
): SocketResponse<null> {
  return {
    success: false,
    message,

    code: 400,
  };
}

// Función para 401 Unauthorized
export function unauthorized(
  message: string = 'No autorizado',
): SocketResponse<null> {
  return {
    success: false,
    message,

    code: 401,
  };
}

// Función para 404 Not Found
export function notFound(
  message: string = 'No encontrado',
): SocketResponse<null> {
  return {
    success: false,
    message,

    code: 404,
  };
}

// Función para 500 Internal Server Error
export function internalServerError(
  message: string = 'Error interno del servidor',
): SocketResponse<null> {
  return {
    success: false,
    message,
    code: 500,
  };
}
