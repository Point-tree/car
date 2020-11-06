
import loggerHeader from "./logger"
import log4js from "log4js"
import express from 'express';
import db from './mongodb/db.js';
import config from 'config-lite';
import router from './routes/index.js';
import cookieParser from 'cookie-parser'
import session from 'express-session';
import connectMongo from 'connect-mongo';
import winston from 'winston';
import expressWinston from 'express-winston';
import 'winston-daily-rotate-file'
import history from 'connect-history-api-fallback';
import chalk from 'chalk';

const app = express();
const logger = log4js.getLogger("app")

app.all('*', (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, token");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	res.header("Access-Control-Allow-Credentials", true); //可以带cookies
	res.header("X-Powered-By", 'Express');
	if (req.method == 'OPTIONS') {
		res.sendStatus(200);
	} else {
		next();
	}
});

app.use(cookieParser());
app.use(loggerHeader)
app.use(express.static(__dirname + '/static'))
router(app);
app.use(function(err, req, res, next){
	logger.error(err.stack);
	res.status(500).send({
		code:-1, message:"System Error", data:err
	});
})
app.use(history());


const server = app.listen(config.port, () => {
	logger.info(
		chalk.green(`成功监听端口：${config.port}`)
	)
});


