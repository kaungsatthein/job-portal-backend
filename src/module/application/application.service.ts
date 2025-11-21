import { Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateApplicationDto) {
    return this.prisma.application.create({
      data: dto,
    });
  }

  findAll() {
    return this.prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.application.findUnique({
      where: { id },
    });
  }

  update(id: string, dto: UpdateApplicationDto) {
    return this.prisma.application.update({
      where: { id },
      data: dto,
    });
  }

  // ⭐ Only change status
  updateStatus(id: string, dto: UpdateApplicationStatusDto) {
    return this.prisma.application.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  remove(id: string) {
    return this.prisma.application.delete({
      where: { id },
    });
  }
}
