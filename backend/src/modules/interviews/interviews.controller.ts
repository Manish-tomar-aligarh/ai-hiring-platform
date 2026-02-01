import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/roles.enum';
import { SubmitResponseDto } from './dto/submit-response.dto';

@ApiTags('interviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post('schedule')
  @UseGuards(RolesGuard)
  @Roles(Role.Candidate)
  @ApiOperation({ summary: 'Schedule AI video interview' })
  schedule(
    @CurrentUser() user: JwtPayload,
    @Body() body: { jobId?: string },
  ) {
    return this.interviewsService.schedule(user.sub, body.jobId ?? null);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.Candidate)
  @ApiOperation({ summary: 'List my interviews' })
  findMy(@CurrentUser() user: JwtPayload) {
    return this.interviewsService.findMyInterviews(user.sub);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(Role.Recruiter, Role.Admin)
  @ApiOperation({ summary: 'List all interviews (Recruiter only)' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.interviewsService.findAllInterviews();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get interview by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.interviewsService.findOne(id, user.sub, user.role);
  }

  @Post(':id/response')
  @UseGuards(RolesGuard)
  @Roles(Role.Candidate)
  @ApiOperation({ summary: 'Submit answer (transcript) for a question' })
  submitResponse(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitResponseDto,
  ) {
    return this.interviewsService.submitResponse(
      id,
      user.sub,
      dto.questionIndex,
      dto.transcript,
    );
  }

  @Post(':id/complete')
  @UseGuards(RolesGuard)
  @Roles(Role.Candidate)
  @ApiOperation({ summary: 'Mark interview as completed and upload video' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/interviews',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    }),
  )
  complete(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const videoUrl = file ? `/uploads/interviews/${file.filename}` : undefined;
    return this.interviewsService.completeInterview(id, user.sub, videoUrl);
  }
}
