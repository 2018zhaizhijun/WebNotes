/* eslint-disable @typescript-eslint/no-explicit-any */
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const customFormat = format.combine(
  format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
  format.align(),
  format.printf(
    (i: { level: any; timestamp: any; message: any }) =>
      `${i.level}: ${[i.timestamp]}: ${i.message}`
  )
);
const defaultOptions = {
  format: customFormat,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  frequency: 'weekly',
  //format: format.json()
};

const globalLogger = createLogger({
  format: customFormat,
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      filename: 'logs/info-%DATE%.log',
      level: 'info',
      ...defaultOptions,
    }),
    new transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      ...defaultOptions,
    }),
  ],
  exitOnError: false,
  exceptionHandlers: [
    new transports.DailyRotateFile({
      filename: 'logs/exceptions.log',
    }),
  ],
});

module.exports = {
  globalLogger: globalLogger,
};
