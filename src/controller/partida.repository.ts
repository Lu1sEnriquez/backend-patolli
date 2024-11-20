import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Partida } from '@prisma/client';

@Injectable()
export class PartidaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partida): Promise<Partida> {
    return this.prisma.partida.create({ data });
  }

  async findByCodigo(codigo: string): Promise<Partida | null> {
    return this.prisma.partida.findUnique({ where: { codigo } });
  }

  async update(codigo: string, data: Partial<Partida>): Promise<Partida> {
    return this.prisma.partida.update({ where: { codigo }, data });
  }

  async delete(codigo: string): Promise<Partida> {
    return this.prisma.partida.delete({ where: { codigo } });
  }
}
