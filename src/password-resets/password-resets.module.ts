import { Module } from '@nestjs/common';
import { PasswordResetsService } from './password-resets-sender.service';

@Module({
  providers: [PasswordResetsService],
  exports: [PasswordResetsService],
})
export class PasswordResetsModule {}
