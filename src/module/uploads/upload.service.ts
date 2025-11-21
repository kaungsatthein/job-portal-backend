// src/upload/upload.service.ts
import { Injectable } from '@nestjs/common';
import { Express } from 'express'; // Need to import this for the type

@Injectable()
export class UploadService {
  saveFileMetadata(file: Express.Multer.File) {
    // Logic to save file metadata (e.g., filename, path, original name) to a database
    console.log('File uploaded:', file);

    return {
      message: 'File uploaded successfully',
      filename: file.filename,
      originalname: file.originalname,
      path: file.path, // Only available if you use diskStorage
    };
  }
}
