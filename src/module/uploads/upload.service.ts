// src/upload/upload.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  private domain = process.env.APP_DOMAIN || 'http://localhost:3000';
  saveFileMetadata(file: Express.Multer.File) {
    console.log('File uploaded:', file);

    const fileUrl = `${this.domain}/${file.path}`;

    return {
      message: 'File uploaded successfully',
      filename: file.filename,
      originalname: file.originalname,
      path: fileUrl, // Only available if you use diskStorage
    };
  }
}
