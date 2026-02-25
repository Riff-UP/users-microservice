import { IsEmail, IsNotEmpty } from 'class-validator';

export class MailDto {
  @IsEmail()
  @IsNotEmpty()
  mail!: string;
}
