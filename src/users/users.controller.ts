import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { mailDto } from 'src/password-resets/dto/mail-dto';
import { PasswordResetsService } from 'src/password-resets/password-resets-sender.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordResetsService: PasswordResetsService,
  ) {}

  @MessagePattern('psswrdResetSender')
  sendPasswordReset(@Payload() mailDto: mailDto) {
    return this.passwordResetsService.psswrdResetSender(mailDto);
  }

  @MessagePattern('findAllUsers')
  findAll() {
    return this.usersService.findAll();
  }

  @MessagePattern('findOneUser')
  findOne(@Payload(new ParseUUIDPipe()) id: string) {
    return this.usersService.findOne(id);
  }

  @MessagePattern('updateUser')
  update(@Payload() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto.id, updateUserDto);
  }

  @MessagePattern('removeUser')
  remove(@Payload(new ParseUUIDPipe()) id: string) {
    return this.usersService.remove(id);
  }
}
