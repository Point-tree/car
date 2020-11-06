

import log4js from "log4js"
import { Token, Random, GenId } from "../utils";
import { AdminUser, DeveloperUser, WXUserSchema, AuthorizationCode } from "../models/schemas";
import chalk from 'chalk';
import path from "path"
import fs from "fs"

class BaseController {
  constructor() {
    this.logger = log4js.getLogger(this.constructor.name)
    this.sendResponseBody = this.sendResponseBody.bind(this)
    this.info = this.info.bind(this)
    this.errorInfo = this.errorInfo.bind(this)
    this.getSchemaList = this.getSchemaList.bind(this)
    this.getTokenUser = this.getTokenUser.bind(this)
    this.getUser=  this.getUser.bind(this)
    this.getUserbyId = this.getUserbyId.bind(this)
    this.getUserId = this.getUserId.bind(this)
  }

  /**打印日志 */
  info({originalUrl}, ...msg){
    this.logger.info(
      chalk.green(originalUrl, "|", ...msg)
    )
  }

  errorInfo({originalUrl}, ...msg){
    this.logger.error(
      chalk.green(originalUrl, "|", ...msg)
    )
  }

  /**获取用户ID */
  async getUserId(req){
    let token = req.header("token");
    return await Token.verifyTokenToid(token)
  }

  /**role: 1超级管理员|2普通管理员|3兑换商城管理员|4开发者|5游戏用户 */
  async getTokenUser(req){
    let userId = await this.getUserId(req)
    this.info(req, userId)
    return await this.getUserbyId(userId)
  }

  /**role: 1超级管理员|2普通管理员|3兑换商城管理员|4开发者|5游戏用户 */
  async getUserbyId(userId){
    return await this.getUser({_id:userId})
  }

  async getUser(query){

    let user = null;
    let admin = await AdminUser.findOne(query) 
    if (admin) user = {...admin._doc};
    let wxuser = await WXUserSchema.findOne(query) 
    if (wxuser) user = {...wxuser._doc, role:5};

    return user;
  }
  /**
   * 获取单表列表
   * @param {*} query 
   * @param {*} pageNo 
   * @param {*} pageSize 
   */
  async getSchemaList(query, sort = "create_time", pageNo = 1, pageSize = 10){
    let temp = query.model
    let tempQuery = query.getQuery() 
    let count = await query.count() || 0;
    let list = (+pageSize != -1 ? await temp.find(tempQuery).sort({[sort]:-1}).skip((+pageNo - 1) * +pageSize).limit(+pageSize).lean() : await temp.find(tempQuery).sort({[sort]:-1}).lean()) || []
    let total = ~~(count / pageSize) || 1

    if (0 < total % pageSize ){
      total = total + 1;
    }
    return {
      count, total, pageNo, nextPage:pageNo >= total ? total : pageNo + 1, pageSize, list
    }
  }

  /**向客户端发送JSON数据 */
  sendResponseBody(res, code = 0, message = "OK", data = {}, state = 200){
    res.status(state).send({
      code, message, data
    });
  }
}

export default BaseController