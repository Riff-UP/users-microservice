import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreatePasswordResetDto } from './dto/create-password-reset.dto';
import { UpdatePasswordResetDto } from './dto/update-password-reset.dto';
import { PrismaService } from 'prisma/prisma.service';
import { mailDto } from './dto/mail-dto';

@Injectable()
export class PasswordResetsService implements OnModuleInit {
  private readonly logger = new Logger('PsswrdResetService');

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.logger.log('PsswrdResetService');
  }

  async psswrdReset(mailDto: mailDto) {}
}
