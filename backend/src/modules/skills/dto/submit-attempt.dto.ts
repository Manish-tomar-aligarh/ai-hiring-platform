import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class SubmitAttemptDto {
  @ApiProperty({ description: 'Question index -> selected answer' })
  @IsObject()
  answers: Record<number, string>;
}
