import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { IndustryService } from './industry.service';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';

@ApiTags('Industry')
@Controller('industry')
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new industry' })
  @ApiBody({ type: CreateIndustryDto })
  @ApiResponse({ status: 201, description: 'Industry created successfully' })
  @ApiResponse({ status: 500, description: 'Failed to create industry' })
  async create(@Body() createIndustryDto: CreateIndustryDto) {
    try {
      return await this.industryService.create(createIndustryDto);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to create industry', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all industries' })
  @ApiResponse({ status: 200, description: 'List of industries' })
  @ApiResponse({ status: 500, description: 'Failed to fetch industries' })
  async findAll() {
    try {
      return await this.industryService.findAll();
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch industries', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single industry by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Industry ID' })
  @ApiResponse({ status: 200, description: 'Industry found' })
  @ApiResponse({ status: 404, description: 'Industry not found' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.industryService.findOne(id);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch industry', error: error.message },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing industry' })
  @ApiParam({ name: 'id', type: String, description: 'Industry ID' })
  @ApiBody({ type: UpdateIndustryDto })
  @ApiResponse({ status: 200, description: 'Industry updated successfully' })
  @ApiResponse({ status: 500, description: 'Failed to update industry' })
  async update(
    @Param('id') id: string,
    @Body() updateIndustryDto: UpdateIndustryDto,
  ) {
    try {
      return await this.industryService.update(id, updateIndustryDto);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to update industry', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an industry by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Industry ID' })
  @ApiResponse({ status: 200, description: 'Industry deleted successfully' })
  @ApiResponse({ status: 500, description: 'Failed to delete industry' })
  async remove(@Param('id') id: string) {
    try {
      return await this.industryService.remove(id);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to delete industry', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
