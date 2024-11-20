import { Module } from '@nestjs/common';
import { PartidaService } from './partida.service';
import { ObserverManager } from './observerManager';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PartidaRepository } from './partida.repository';

@Module({
  providers: [ObserverManager, PartidaService, PartidaRepository],
  imports: [PrismaModule],
})
export class PartidaModule {}
