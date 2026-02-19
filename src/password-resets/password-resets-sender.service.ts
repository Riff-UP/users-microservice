import {
  HttpCode,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { mailDto } from './dto/mail-dto';
import { RpcException } from '@nestjs/microservices';
import { randomBytes, createHash } from 'crypto';
import { timeStamp } from 'console';

@Injectable()
export class PasswordResetsService implements OnModuleInit {
  private readonly logger = new Logger('PsswrdResetService');

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.logger.log('PsswrdResetService');
  }

  async psswrdResetSender(mailDto: mailDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: mailDto.mail },
    });

    if (!user) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'user not found',
      });
    } else {
      //Generación del token
      const rawToken = (size: number = 32): string => {
        return randomBytes(size).toString('hex');
      };

      //Hasheo
      const hashedToken = (generateToken: string) => {
        return createHash('sha256').update(generateToken).digest('hex');
      };

      await this.prisma.passwordReset.create({
        data: {
          userId: user.id,
          token: hashedToken(rawToken()),
          expiresAt: new Date(Date.now() + 900),
        },
      });

      
    }
  }
}
