'use strict';

import mongoose from 'mongoose';
import config from 'config-lite';
import chalk from 'chalk';
import log4js from "log4js"
import init from './init';
// https://www.jianshu.com/p/8af0552831f6


mongoose.connect(config.url, { useMongoClient: true });
mongoose.Promise = global.Promise;

const db = mongoose.connection;
const logger = log4js.getLogger("mongoose-db")

db.once('open', () => {
  logger.info(
    chalk.green('连接数据库成功')
  );

  init()
})

db.on('error', function (error) {
  logger.error(
    chalk.red('Error in MongoDb connection: ' + error)
  );
  mongoose.disconnect();
});

db.on('close', function () {
  logger.info(
    chalk.red('数据库断开，重新连接数据库')
  );
  mongoose.connect(config.url, { server: { auto_reconnect: true } });
});

export default db;
