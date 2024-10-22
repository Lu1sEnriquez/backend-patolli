import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { PartidaService } from './partida.service';
import { Server } from 'socket.io';
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
export class PartidaController {
  @WebSocketServer()
  server: Server; // Servidor WebSocket

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
  async unirJugador(@MessageBody() data: string) {
    console.log(data);
    let parsedDto: { codigo: string; nombre: string };

    try {
      parsedDto = JSON.parse(data);
    } catch (error) {
      console.log(error);

      return badRequest('Invalid JSON format');
    }
    const response: SocketResponse<Partida | null> =
      await this.partidaService.unirJugador(parsedDto.codigo, {
        nombre: parsedDto.nombre,
      });

    this.server.emit(SocketEvents.JUGADOR_UNIDO, response);
    return response;
  }
}
