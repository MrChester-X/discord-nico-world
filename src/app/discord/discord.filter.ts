import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { DiscordjsErrorMixin } from 'discord.js';

@Catch(DiscordjsErrorMixin)
export class DiscordExceptionFilter extends BaseExceptionFilter {
  private logger = new Logger(DiscordExceptionFilter.name);

  catch(exception: any, _host: ArgumentsHost): void {
    this.logger.error('Some discord.js error:', exception);
  }
}
