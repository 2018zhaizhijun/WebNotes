/* eslint-disable @typescript-eslint/no-explicit-any */
const { globalLogger } = require('./winston-logger');

export class Logger {
  public static error(e: any) {
    globalLogger.error(e);
  }

  public static info(message: any) {
    globalLogger.info(message);
  }

  public static warn(message: any) {
    globalLogger.warn(message);
  }

  public static debug(message: any) {
    globalLogger.debug(message);
  }
}
