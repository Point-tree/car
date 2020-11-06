'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

/**报名记录 */
export const RegistrationRecord = mongoose.model("registration_record", new Schema({
  /**姓名 */
  name: { type: String, default: "" },
  /**电话 */
  phone: { type: String, default: "" },
  /**QQ */
  qq: { type: String, default: "" },
  /**微信 */
  wechat: { type: String, default: "" },
  /**留言 */
  text: { type: String, default: "" },
  /**创建时间 */
  create_time: { type: String, default: "" },
  /**其他备用数据 */
  other_item: Object,
  /**是否已经处理 */
  enabled: { type: Boolean, default: false },
}))

/**管理员 */
export const AdminUser = mongoose.model("admin_user", new Schema({
  /**真实姓名 */
  name: String,
  /**手机号码 */
  phone: String,
  username: String,
  password: String,
  /**角色： 1超级管理员|2普通管理员|3兑换商城管理员*/
  role: { type: Number, default: 0 },
  /**同时有效授权码的数量 */
  authorization_code_max_length: { type: Number, default: 10 },
  /**目前拥有的数量 */
  authorization_code_length: { type: Number, default: 0 },
  /**最后登陆时间 */
  last_login_time: { type: String, default: "" },
  /**创建时间 */
  create_time: { type: String, default: "" },
  /**其他备用数据 */
  other_item: Object,
  enabled: { type: Boolean, default: true },
}))

/**用户手机号 */
export const User = mongoose.model("save_phone", new Schema({
  /** 预留手机号 */ 
  phone: { type: String },
  /**创建时间 */
  create_time: { type: String, default: "" },
  /**其他备用数据 */
  other_item: Object,
  /**是否已经处理 */
  enabled: { type: Boolean, default: false },
}))
