import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    console.log('createCompanyDto :>> ', createCompanyDto);
    const company = await this.prisma.company.create({
      data: { ...createCompanyDto, status: 'pending' },
    });

    return company;
  }

  async findAll() {
    return this.prisma.company.findMany({
      include: {
        industry: true,
        recruiters: true,
        jobPostings: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.company.findUnique({
      where: { id },
      include: {
        industry: true,
        recruiters: true,
        jobPostings: true,
      },
    });
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });

    // Notify recruiters of this company that the company info was updated
    const recruiters = await this.prisma.user.findMany({
      where: { companyId: id, status: { not: 'DELETE' } },
    });

    const notifications = recruiters.map((rec) => ({
      userId: rec.id,
      message: `Company "${company.name}" information has been updated.`,
      type: 'company',
      isRead: false,
    }));

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({ data: notifications });
    }

    return company;
  }

  async remove(id: string) {
    const company = await this.prisma.company.delete({
      where: { id },
    });

    // Notify all admins that a company was deleted
    const admins = await this.prisma.user.findMany({
      where: { role: 'admin', status: { not: 'DELETE' } },
    });

    const notifications = admins.map((admin) => ({
      userId: admin.id,
      message: `Company "${company.name}" has been deleted.`,
      type: 'company',
      isRead: false,
    }));

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({ data: notifications });
    }

    return company;
  }
}
