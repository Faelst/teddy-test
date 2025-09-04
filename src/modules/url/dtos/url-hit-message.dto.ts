// src/worker/dto/url-hit.message.ts
import {
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  IsUrl,
} from 'class-validator';

export class UrlHitMessageDto {
  @IsUUID('4')
  urlId!: string;

  @IsString()
  @Matches(/^[A-Za-z0-9_-]{1,6}$/, {
    message: 'code must be 1–6 chars, letters/numbers/_/-',
  })
  code!: string;

  @IsUrl(
    { require_protocol: true, require_tld: false },
    { message: 'originalUrl must be a valid http(s) URL' },
  )
  originalUrl!: string;

  @IsOptional()
  @IsISO8601()
  at?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  ip?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  userAgent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  referer?: string;
}
