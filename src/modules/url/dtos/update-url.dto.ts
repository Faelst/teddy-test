import { IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUrlDto {
  @IsString()
  @MaxLength(2048)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  url!: string;
}
