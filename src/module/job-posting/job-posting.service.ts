import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobPostingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createJobPostingDto: CreateJobPostingDto) {
    return this.prisma.jobPosting.create({
      data: createJobPostingDto,
    });
  }

  async findAll() {
    return this.prisma.jobPosting.findMany({
      include: {
        recruiter: true,
        company: true,
        applications: true,
      },
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.jobPosting.findUnique({
      where: { id },
      include: {
        recruiter: true,
        company: true,
        applications: true,
      },
    });
    if (!job) throw new NotFoundException(`JobPosting with ID ${id} not found`);
    return job;
  }

  async update(id: string, updateJobPostingDto: UpdateJobPostingDto) {
    const job = await this.prisma.jobPosting.findUnique({ where: { id } });
    if (!job) throw new NotFoundException(`JobPosting with ID ${id} not found`);

    return this.prisma.jobPosting.update({
      where: { id },
      data: updateJobPostingDto,
    });
  }

  async remove(id: string) {
    const job = await this.prisma.jobPosting.findUnique({ where: { id } });
    if (!job) throw new NotFoundException(`JobPosting with ID ${id} not found`);

    return this.prisma.jobPosting.delete({ where: { id } });
  }

  // Extra: Find jobs by company
  async findByCompany(companyId: string) {
    return this.prisma.jobPosting.findMany({
      where: { companyId },
      include: { recruiter: true, company: true },
    });
  }

  // Extra: Find jobs by recruiter
  async findByRecruiter(recruiterId: string) {
    return this.prisma.jobPosting.findMany({
      where: { recruiterId },
      include: { company: true },
    });
  }
}
