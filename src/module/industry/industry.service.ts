import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IndustryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createIndustryDto: CreateIndustryDto) {
    try {
      return await this.prisma.industry.create({
        data: createIndustryDto,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create industry: ${error.message}`,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.industry.findMany({
        include: {
          companies: true, // include related companies if needed
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch industries: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const industry = await this.prisma.industry.findUnique({
        where: { id },
        include: {
          companies: true,
        },
      });

      if (!industry) {
        throw new NotFoundException(`Industry with id ${id} not found`);
      }

      return industry;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch industry: ${error.message}`,
      );
    }
  }

  async update(id: string, updateIndustryDto: UpdateIndustryDto) {
    try {
      return await this.prisma.industry.update({
        where: { id },
        data: updateIndustryDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Industry with id ${id} not found`);
      }
      throw new InternalServerErrorException(
        `Failed to update industry: ${error.message}`,
      );
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.industry.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Industry with id ${id} not found`);
      }
      throw new InternalServerErrorException(
        `Failed to delete industry: ${error.message}`,
      );
    }
  }
}
