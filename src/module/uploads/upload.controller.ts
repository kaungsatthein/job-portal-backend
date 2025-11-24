import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { Public } from 'src/common/decorators/public';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  @Public()
  @Post('single')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadSingleFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.saveFileMetadata(file);
  }
}
