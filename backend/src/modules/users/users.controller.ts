import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { User } from './entities/user.entity';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async me(@CurrentUser() payload: JwtPayload): Promise<Partial<User>> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new Error('User not found');
    const { password, ...rest } = user;
    return rest;
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update profile' })
  async updateProfile(
    @CurrentUser() payload: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.update(payload.sub, dto);
  }
}
