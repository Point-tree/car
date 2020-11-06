import { SystemParameter, AdminUser, GoodsType} from "../models/schemas";
import { MD5, isBlank, HTTPPost, CreateTime } from "../utils";
import log4js from "log4js"
import config from 'config-lite';
import GlobalData from "../models/GlobalData";
import { Types } from "mongoose";

const logger = log4js.getLogger("init")

/**初始化数据 */
export default async function init(){
  
  ///2、检查超级管理员是否存在，不存在则新建
  let superAdmin = await AdminUser.findOne({role:1}).lean()
  if(!superAdmin) await AdminUser.create({role:1, username:config.superAdmin.username, password:MD5(config.superAdmin.password), create_time:CreateTime()})
  //////////////////////////////////////////////////
}