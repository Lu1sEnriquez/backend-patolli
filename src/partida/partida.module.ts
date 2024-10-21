import { Module } from '@nestjs/common';
import { PartidaService } from './partida.service';
import { PartidaGateway } from './partida.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [PartidaGateway, PartidaService],
  imports: [PrismaModule],
})
export class PartidaModule {}
