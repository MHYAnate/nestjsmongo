import { IsString, IsOptional } from 'class-validator';

export class CreateItemDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}