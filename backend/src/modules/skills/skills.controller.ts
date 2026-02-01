import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/roles.enum';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';

@ApiTags('skills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get('tests')
  @ApiOperation({ summary: 'List skill tests (MCQ/coding)' })
  findTests(@CurrentUser() user: JwtPayload, @Query('skillTags') skillTags?: string) {
    const tags = skillTags ? skillTags.split(',').map((s) => s.trim()) : undefined;
    return this.skillsService.findTests(user.sub, tags);
  }

  @Get('tests/:id')
  @ApiOperation({ summary: 'Get skill test by ID' })
  findOneTest(@Param('id') id: string) {
    return this.skillsService.findOneTest(id);
  }

  @Post('tests/:id/start')
  @UseGuards(RolesGuard)
  @Roles(Role.Candidate)
  @ApiOperation({ summary: 'Start a skill test attempt' })
  startAttempt(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.skillsService.startAttempt(user.sub, id);
  }

  @Post('attempts/:attemptId/submit')
  @UseGuards(RolesGuard)
  @Roles(Role.Candidate)
  @ApiOperation({ summary: 'Submit answers and get score' })
  submitAttempt(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitAttemptDto,
  ) {
    return this.skillsService.submitAttempt(attemptId, user.sub, dto.answers);
  }

  @Get('attempts')
  @UseGuards(RolesGuard)
  @Roles(Role.Candidate)
  @ApiOperation({ summary: 'List my skill test attempts' })
  getMyAttempts(@CurrentUser() user: JwtPayload) {
    return this.skillsService.getMyAttempts(user.sub);
  }
}
