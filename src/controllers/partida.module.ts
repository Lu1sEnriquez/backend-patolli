import { Module } from '@nestjs/common';
import { PartidaService } from './partida.service';
import { PartidaController } from './partida.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [PartidaController, PartidaService],
  imports: [PrismaModule],
})
export class PartidaModule {}
