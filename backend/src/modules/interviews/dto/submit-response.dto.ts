import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class SubmitResponseDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  questionIndex: number;

  @ApiProperty({ description: 'Speech-to-text transcript of answer' })
  @IsString()
  transcript: string;
}
