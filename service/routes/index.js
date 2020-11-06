'use strict';

import bodyParser from 'body-parser';
import multipart from 'connect-multiparty';
import expressWs from "express-ws"
import fs from "fs";
import path from "path";
import admin from './admin';
import { TEMP_FILE_PATH, IMAGE_PATH, STATIC_PATH, VIDEO_PATH } from '../models/GlobalData';


if (!fs.existsSync(TEMP_FILE_PATH)) {
	fs.mkdirSync(TEMP_FILE_PATH, {recursive:true})
}
if (!fs.existsSync(IMAGE_PATH)) {
  fs.mkdirSync(IMAGE_PATH, {recursive:true})
}
if (!fs.existsSync(VIDEO_PATH)) {
  fs.mkdirSync(VIDEO_PATH, {recursive:true})
}
if (!fs.existsSync(STATIC_PATH)) {
  fs.mkdirSync(STATIC_PATH, {recursive:true})
}
export default app => {
	expressWs(app)
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(multipart({ uploadDir:  TEMP_FILE_PATH}));

	app.use("/api", admin)
}


