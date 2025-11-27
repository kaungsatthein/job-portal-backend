import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ApplicationService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService, // 👈 Inject notification service
  ) {}

  // -----------------------------------------------------
  // 1️⃣ Create Application + AUTO notification to recruiter
  // -----------------------------------------------------
  async create(dto: CreateApplicationDto) {
    // Make sure job exists
    const job = await this.prisma.jobPosting.findUnique({
      where: { id: dto.jobId },
      include: { recruiter: true },
    });

    if (!job) throw new NotFoundException('Job not found');

    // Create application
    const application = await this.prisma.application.create({
      data: dto,
    });

    // AUTO NOTIFICATION → Recruiter
    await this.notificationService.create({
      userId: job.recruiterId,
      applicationId: application.id,
      message: `New application received for "${job.title}".`,
      type: 'application_received',
    });

    return application;
  }

  // -----------------------------------------------------
  // 2️⃣ Get All Applications
  // -----------------------------------------------------
  findAll() {
    return this.prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // -----------------------------------------------------
  // 3️⃣ Get One Application
  // -----------------------------------------------------
  findOne(id: string) {
    return this.prisma.application.findUnique({
      where: { id },
    });
  }

  // -----------------------------------------------------
  // 4️⃣ Update Application Normally
  // -----------------------------------------------------
  update(id: string, dto: UpdateApplicationDto) {
    return this.prisma.application.update({
      where: { id },
      data: dto,
    });
  }

  // -----------------------------------------------------
  // 5️⃣ Update Status + AUTO notification to researcher
  // -----------------------------------------------------
  async updateStatus(id: string, dto: UpdateApplicationStatusDto) {
    // Fetch application with job + researcher
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        researcher: true,
      },
    });

    if (!application) throw new NotFoundException('Application not found');

    // Update status
    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: dto.status },
    });

    // AUTO NOTIFICATION → Researcher
    await this.notificationService.create({
      userId: application.researcherId,
      applicationId: id,
      message: `Your application for "${application.job.title}" was ${dto.status}.`,
      type: 'application_status_updated',
    });

    return updated;
  }

  // -----------------------------------------------------
  // 6️⃣ Delete Application
  // -----------------------------------------------------
  remove(id: string) {
    return this.prisma.application.delete({
      where: { id },
    });
  }
}
