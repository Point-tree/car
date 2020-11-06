import BaseController from "./BaseController";
import config from 'config-lite';
import fs from "fs";
import ObjectID from 'mongodb';
import mongoose from 'mongoose'
import path from "path";
import axios from "axios";
import { CreateTime, isBlank, MD5, Token, GenId } from "../utils";
import { IMAGE_PATH, STATIC_PATH, TEMP_FILE_PATH, VIDEO_PATH} from "../models/GlobalData";
import { AdminUser, User} from "../models/schemas";

/**
 * 微信请求控制器，负责微信端的所有动作
 */
class AdminController extends BaseController {
  constructor() {
    super()
    this.login = this.login.bind(this)
    this.modifyAdministratorPassword = this.modifyAdministratorPassword.bind(this)
    this.savePhone = this.savePhone.bind(this)
    this.findPhone = this.findPhone.bind(this)
    this.sendMsg = this.sendMsg.bind(this)
  }

  /**登录 */
  async login(req, res, next) {
    try {
      let { username, password } = req.body;
      let adminUser = await AdminUser.findOne({ username, password: MD5(password) }).lean();
      if (adminUser) {
        await AdminUser.findByIdAndUpdate(adminUser._id, { last_login_time: CreateTime() })
        return this.sendResponseBody(res, 0, "登陆成功", {
          name: adminUser.name,
          username: adminUser.username,
          token: Token.createTokenByid(adminUser._id)
        })
      } else {
        return this.sendResponseBody(res, -1, "用户名/密码不正确")
      }
    } catch (error) {
      next(error)
    }
  }
  /**修改管理员密码 */
  async modifyAdministratorPassword(req, res, next) {
    try {
      let { username, password, newPassword } = req.body;
      let adminUser = await AdminUser.findOne({ username, password: MD5(password) }).lean();
      if (adminUser) {
        await AdminUser.findByIdAndUpdate(adminUser._id, { password: MD5(newPassword) })
        return this.sendResponseBody(res, 0, "修改成功")
      } else {
        return this.sendResponseBody(res, -1, "用户名/密码不正确")
      }
    } catch (error) {
      next(error)
    }
  }
  /**预留手机号码 */
  async savePhone(req, res, next) {
    try {
      let phone = req.query.phone
      await User.create({ phone, create_time: CreateTime(), enabled: false })
      return this.sendResponseBody(res, 0, "", "预留成功")
    } catch (error) {
      next(error)
    }
  }
  /**查找手机号码 */
  async findPhone(req, res, next) {
    try {
      let phone = req.query.phone
      let user = await User.find({phone}).lean()
      if (user.length) {
        return this.sendResponseBody(res, 0, "", "预留失败")
      }
      return this.sendResponseBody(res, 0, "", "该手机号还未预留");
    } catch (error) {
      next(error)
    }
  }
  /**发送手机短信 */
  async sendMsg(req, res, next) {
    let {phone, number} = req.query
    let params = {
      account: 'N1534420',
      password: 'lQp26Ex5uybc00',
      msg: "【椿湫网络】亲爱的用户，您的短信验证码为"+number+"，1分钟内有效，若非本人操作请忽略。",
      phone
    };
    axios.post('http://smssh1.253.com/msg/send/json', params)
    .then(response => {
      console.log(response);
      if(response.status == 0) {
        console.log(response);
      }
    }).catch((e)=>{
      console.log(e);
    })
    return this.sendResponseBody(res, 0, "", "已发送手机短信");
  }
}

export default new AdminController;





// Mozilla/5.0 (Linux; Android 9; ELE-AL00 Build/HUAWEIELE-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044755 Mobile Safari/537.36 MMWEBID/2086 MicroMessenger/7.0.4.1420(0x2700043B) Process/tools NetType/WIFI Language/zh_CN | 113.117.58.73 | 4 | POST | 200 | /wx/getUserInfo | {req_data:{"query":{},"body":{},"params":{}}, headers:{"accept":"application/json, text/plain, */*","accept-encoding":"gzip","accept-language":"zh-CN,en-US;q=0.9","connection":"close","content-length":"2","content-type":"application/json;charset=UTF-8","host":"wx.couplefish.com:8001","origin":"http://wx.couplefish.com","referer":"http://wx.couplefish.com/exchange_record_details.html?id=5cf664a1e78abc085c437b39","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjYzA1Zjg1MzhiYTcwMmVmYzkwYWI0NyIsImlhdCI6MTU1OTY1MjA5OSwiZXhwIjoxNTU5ODI0ODk5fQ.TbAcw5-2nAUr_eQSTXolOVsm8TyqlpbSENXTywT67Mg","user-agent":"Mozilla/5.0 (Linux; Android 9; ELE-AL00 Build/HUAWEIELE-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044755 Mobile Safari/537.36 MMWEBID/2086 MicroMessenger/7.0.4.1420(0x2700043B) Process/tools NetType/WIFI Language/zh_CN","x-forwarded-for":"113.117.58.73","x-forwarded-for-pound":"113.117.58.73","x-requested-with":"com.tencent.mm"}}}