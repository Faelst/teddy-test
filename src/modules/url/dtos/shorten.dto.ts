import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class ShortenDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsUrl(
    { require_protocol: true, require_tld: false },
    { message: 'url must be a valid http(s) URL' },
  )
  url!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(6, { message: 'alias must be at most 6 characters' })
  @Matches(/^[A-Za-z0-9]+$/, {
    message: 'alias may contain only letters and numbers',
  })
  alias?: string;
}
