'use strict';

module.exports = {
  /**程序监听的端口 */
  port: parseInt(process.env.PORT, 10) || 8013,
  /**mongodb 的连接地址 */
  url: "mongodb://bsw:bsw2018.@119.23.211.80:22018/black_swan",
  /**超级管理员的用户名密码 */
  superAdmin: {
    username: "admin",
    password: "admin"
  },

  external_url: "//",
}