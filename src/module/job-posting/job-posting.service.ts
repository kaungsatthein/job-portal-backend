import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus, JobType } from '@prisma/client';

@Injectable()
export class JobPostingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createJobPostingDto: CreateJobPostingDto) {
    return this.prisma.jobPosting.create({
      data: createJobPostingDto,
    });
  }

  async findAll({
    status,
    search,
    jobType,
    startDate,
    endDate,
    page,
    limit,
  }: {
    status?: JobStatus;
    search?: string;
    jobType?: JobType;
    startDate?: string;
    endDate?: string;
    page: number;
    limit: number;
  }) {
    const where: any = {};

    // status filter
    if (status) where.status = status;

    // jobType filter
    if (jobType) where.jobType = jobType;

    // date filter
    if (startDate || endDate) {
      where.createdAt = {};

      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }

      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        {
          company: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    // pagination
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.jobPosting.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          recruiter: true,
          company: true,
          applications: true,
        },
      }),
      this.prisma.jobPosting.count({ where }),
    ]);

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data,
    };
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
