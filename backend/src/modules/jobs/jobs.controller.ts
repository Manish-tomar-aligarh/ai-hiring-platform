import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Role } from '../../common/enums/roles.enum';

@ApiTags('jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.Recruiter, Role.Admin)
  @ApiOperation({ summary: 'Post a new job' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateJobDto) {
    return this.jobsService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List jobs (recruiters see only their jobs)' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.jobsService.findAll(user.role, user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.Recruiter, Role.Admin)
  @ApiOperation({ summary: 'Update job' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobsService.update(id, user.sub, user.role, dto);
  }

  @Post(':id/apply')
  @UseGuards(RolesGuard)
  @Roles(Role.Candidate)
  @ApiOperation({ summary: 'Apply to job' })
  apply(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.jobsService.apply(user.sub, id);
  }

  @Get(':id/applications')
  @UseGuards(RolesGuard)
  @Roles(Role.Recruiter, Role.Admin)
  @ApiOperation({ summary: 'List applications for a job' })
  getApplications(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.jobsService.getApplicationsForJob(id, user.sub);
  }

  @Patch('applications/:applicationId/shortlist')
  @UseGuards(RolesGuard)
  @Roles(Role.Recruiter, Role.Admin)
  @ApiOperation({ summary: 'Shortlist an application' })
  shortlist(
    @Param('applicationId') applicationId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.jobsService.shortlist(applicationId, user.sub);
  }
}
