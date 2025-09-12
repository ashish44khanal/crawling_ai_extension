import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class AppLogger extends ConsoleLogger {
  constructor(context: string = 'App') {
    super('App', {
      timestamp: true,
      logLevels: ['log', 'error', 'warn', 'debug', 'verbose'],
      prefix: `${process.env.APP_ENV} - API`,
      context: context,
    });
  }

  log(message: string, context?: string) {
    super.log(message, context ?? 'App');
  }

  warn(message: string, context?: string) {
    super.warn(message, context ?? 'App');
  }

  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context ?? 'App');
  }

  debug(message: string, context?: string) {
    super.debug(message, context ?? 'App');
  }

  verbose(message: string, context?: string) {
    super.verbose(message, context ?? 'App');
  }
}
