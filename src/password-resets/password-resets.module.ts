import { Module } from '@nestjs/common';
import { PasswordResetsService } from './services/password-resets.service';
import { PasswordResetsSenderService } from './services/password-resets-sender.service';
import { PasswordResetsController } from './password-resets.controller';

@Module({
  controllers: [PasswordResetsController],
  providers: [PasswordResetsService, PasswordResetsSenderService],
})
export class PasswordResetsModule {}
