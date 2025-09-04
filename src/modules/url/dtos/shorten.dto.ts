import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsNotReserved } from '../../../commons/decorators/is-not-reserved.decorator';

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
  @MaxLength(6)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'alias may contain only letters, numbers, "_" or "-"',
  })
  @IsNotReserved({ message: 'alias is reserved' })
  alias?: string;
}
