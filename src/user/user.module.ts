import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UsersService } from './user.service';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // ← ESTO ES LO QUE FALTA
  controllers: [UserController],
  providers: [UsersService],
})
export class UserModule {}