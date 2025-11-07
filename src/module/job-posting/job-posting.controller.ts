import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { JobPostingService } from './job-posting.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Job Postings')
@Controller('job-postings')
export class JobPostingController {
  constructor(private readonly jobPostingService: JobPostingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job posting' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  create(@Body() createJobPostingDto: CreateJobPostingDto) {
    return this.jobPostingService.create(createJobPostingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all job postings' })
  @ApiResponse({ status: 200, description: 'List of job postings' })
  findAll() {
    return this.jobPostingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job posting by ID' })
  @ApiResponse({ status: 200, description: 'Job posting found' })
  findOne(@Param('id') id: string) {
    return this.jobPostingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a job posting by ID' })
  @ApiResponse({ status: 200, description: 'Job updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateJobPostingDto: UpdateJobPostingDto,
  ) {
    return this.jobPostingService.update(id, updateJobPostingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a job posting by ID' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  remove(@Param('id') id: string) {
    return this.jobPostingService.remove(id);
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get job postings by company' })
  findByCompany(@Param('companyId') companyId: string) {
    return this.jobPostingService.findByCompany(companyId);
  }

  @Get('recruiter/:recruiterId')
  @ApiOperation({ summary: 'Get job postings by recruiter' })
  findByRecruiter(@Param('recruiterId') recruiterId: string) {
    return this.jobPostingService.findByRecruiter(recruiterId);
  }
}
