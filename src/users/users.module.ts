import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PasswordResetsModule } from '../password-resets/password-resets.module';

@Module({
  imports: [PasswordResetsModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
