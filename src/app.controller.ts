import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { MulterField } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const ERROR_MESSAGE =
  'Invalid file type. Only video/mp4 and image/jpeg are supported.';

const filesToIntercept: MulterField[] = [
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
];

const fileFilter = (_req, file, cb) => {
  if (file.mimetype !== 'video/mp4' && file.mimetype !== 'image/jpeg') {
    return cb(new BadRequestException(ERROR_MESSAGE), false);
  }
  return cb(null, true);
};

const storage = diskStorage({
  destination: '.uploads',
  filename: (_req, file, cb) => {
    return cb(
      null,
      `${Date.now()}-${randomUUID()}${extname(file.originalname)}`,
    );
  },
});

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('video')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor(filesToIntercept, {
      dest: './uploads',
      storage,
      fileFilter,
    }),
  )
  async uploadVideo(
    @Req() _req: Request,
    @UploadedFiles()
    files: { video?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] },
  ): Promise<string> {
    console.log(files);
    return 'video uploaded';
  }
}
