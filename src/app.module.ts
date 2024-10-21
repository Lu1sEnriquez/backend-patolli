import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PartidaModule } from './partida/partida.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PartidaModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
