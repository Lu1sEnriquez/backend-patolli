import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { PartidaService } from './partida.service';
import { Server, Socket } from 'socket.io';
import { Partida } from '@prisma/client';
import {
  badRequest,
  SocketEvents,
  SocketResponse,
} from 'src/interface/socket-response';
import { CreatePartidaDto } from '../dto/partida.dto';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000', // Permitir solicitudes CORS desde este origen
    methods: ['GET', 'POST'], // Métodos permitidos
    credentials: true, // Permitir credenciales
  },
})

// partida controller se encarga de utilizar
//  el service y guardar la informacion
export class PartidaController implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server; // Servidor WebSocket

  // Almacenar la relación entre el socket y el jugador.
  private jugadoresConectados: Map<string, string> = new Map(); // socket.id -> jugador.id

  constructor(private readonly partidaService: PartidaService) {}

  @SubscribeMessage(SocketEvents.CREAR_PARTIDA)
  async crearPartida(@MessageBody() createPartidaDto: string) {
    let parsedDto: CreatePartidaDto;
    console.log('antes de parsear');

    try {
      parsedDto = JSON.parse(createPartidaDto);
    } catch (error) {
      console.log(error);

      return badRequest('Invalid JSON format');
    }
    console.log(parsedDto);

    const response: SocketResponse<Partida | null> =
      await this.partidaService.crearPartida(parsedDto);
    console.log('response');
    console.log(response);

    this.server.emit(SocketEvents.PARTIDA_CREADA, response);
    return response;
  }

  @SubscribeMessage(SocketEvents.UNIRSE_PARTIDA)
  async unirJugador(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(data);
    let parsedDto: { codigo: string; nombre: string };

    try {
      parsedDto = JSON.parse(data);
    } catch (error) {
      console.log(error);

      return badRequest('Invalid JSON format');
    }
    // Almacenar el nombre del jugador y el código de la partida en el socket
    client.data.jugadorNombre = parsedDto.nombre;
    client.data.codigoPartida = parsedDto.codigo;

    const response: SocketResponse<Partida | null> =
      await this.partidaService.unirJugador(parsedDto.codigo, {
        nombre: parsedDto.nombre,
      });

    this.server.emit(SocketEvents.JUGADOR_UNIDO, response);
    return response;
  }

  @SubscribeMessage(SocketEvents.ELIMINAR_JUGADOR)
  async sacarJugador(@MessageBody() data: string) {
    console.log(data);
    let parsedDto: { codigo: string; nombre: string; id: number };

    try {
      parsedDto = JSON.parse(data);
    } catch (error) {
      console.log(error);

      return badRequest('Invalid JSON format');
    }
    const response: SocketResponse<Partida | null> =
      await this.partidaService.salirJugador(parsedDto.codigo, {
        id: parsedDto.id,
      });

    this.server.emit(SocketEvents.ELIMINAR_JUGADOR, response);
    return response;
  }

  async handleDisconnect(client: Socket) {
    const jugadorNombre = client.data.jugadorNombre;
    const codigoPartida = client.data.codigoPartida;

    console.log(
      `Client disconnected: ${client.id}, Jugador: ${jugadorNombre}, Partida: ${codigoPartida}`,
    );

    // Lógica para sacar al jugador de la partida
    if (jugadorNombre && codigoPartida) {
      const response: SocketResponse<Partida | null> =
        await this.partidaService.suspenderJugador(
          codigoPartida,
          jugadorNombre,
        );

      this.server.emit(SocketEvents.JUGADOR_DESCONECTADO, response);
    }
  }

  // metodos del juego

  // Nuevo evento para ingresar ficha en el inicio
  @SubscribeMessage(SocketEvents.INGRESAR_FICHA)
  async ingresarFicha(
    @MessageBody() data: string,
    // @ConnectedSocket() client: Socket,
  ) {
    let parsedDto: {
      codigo: string;
      idJugador: number;
      idFicha: number;
      cantidad: number;
    };

    try {
      parsedDto = JSON.parse(data);
    } catch (error) {
      console.log(error);
      return badRequest('Invalid JSON format');
    }

    const response = await this.partidaService.moverFichaEnPartida(
      parsedDto.codigo,
      parsedDto.idJugador,
      parsedDto.idFicha,
      parsedDto.cantidad,
    );

    this.server.emit(SocketEvents.INGRESAR_FICHA, response);
    return response;
  }

  // Mover ficha ya fue implementado anteriormente

  // Nuevo evento para mover ficha
  @SubscribeMessage(SocketEvents.MOVER_FICHA)
  async moverFicha(@MessageBody() data: string) {
    let parsedDto: {
      codigo: string;
      idJugador: number;
      idFicha: number;
      cantidad: number;
    };

    try {
      parsedDto = JSON.parse(data);
    } catch (error) {
      console.log(error);
      return badRequest('Invalid JSON format');
    }

    const response = await this.partidaService.moverFichaEnPartida(
      parsedDto.codigo,
      parsedDto.idJugador,
      parsedDto.idFicha,
      parsedDto.cantidad,
    );

    this.server.emit(SocketEvents.MOVER_FICHA, response);
    console.log(response.message);

    return response;
  }
}
