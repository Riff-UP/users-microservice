import { Module } from '@nestjs/common';
import { PasswordResetsService } from './password-resets.service';
import { PasswordResetsSenderService } from './password-resets-sender.service';
import { PasswordResetsController } from './password-resets.controller';

@Module({
  controllers: [PasswordResetsController],
  providers: [PasswordResetsService, PasswordResetsSenderService],
})
export class PasswordResetsModule {}
