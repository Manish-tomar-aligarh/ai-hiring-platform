import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiConsumes, ApiProperty } from '@nestjs/swagger';
import { ResumesService } from './resumes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/roles.enum';

@ApiTags('resumes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles(Role.Candidate)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload resume PDF' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  upload(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File required');
    return this.resumesService.upload(user.sub, file);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.Candidate)
  @ApiOperation({ summary: 'List my resumes' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.resumesService.findByUser(user.sub);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.Candidate)
  @ApiOperation({ summary: 'Get resume with analysis' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.resumesService.findOne(id, user.sub);
  }
}
