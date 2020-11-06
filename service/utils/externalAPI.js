import { HTTPGet, HTTPPost, MD5, SHA1 } from "./index";
import config from 'config-lite';
import { getLogger } from "log4js";
import FormData from 'form-data';

const logger = getLogger("externalAPI")

logger.errorMsg = function(msg, data){
  let error = new Error(`${msg}: ${JSON.stringify(data)}`)
  logger.error(error.message)
  return error;
}

const WxToken = {}
const WxJsApiTicket = {}
const WxCardTicket = {}
const WxJSApiSignatureUrls = {}

export const WXAPI = {
  /**
   * 获取网页授权的用户信息
   * @param {*} access_token 网页授权的 access_token [getSnsAccessToken]
   * @param {*} openid 
   */
  async getSnsUserInfo(access_token, openid) {
    return await HTTPGet(`https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`)
  },
  /**
   * 获取网页授权 access_token 
   * @param {*} appid 
   * @param {*} appsecret 
   * @param {*} code 网页重定向返回的 code
   */
  async getSnsAccessToken(code, appid = config.wx.appid, appsecret = config.wx.appsecret) {
    return await HTTPGet(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${appsecret}&code=${code}&grant_type=authorization_code`)
  },
  /**
   * 获取微信网页授权重定向URL
   * @param {*} appid 
   * @param {*} url 
   */
  getSnsRedirectUri(url, appid = config.wx.appid) {
    return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${url}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
  },

  WxToken(appid = config.wx.appid){
    if(!WxToken[appid]) WxToken[appid] = {expires_in:0}
    return WxToken[appid]
  },
  /**
   * 获取微信授权 Token
   * @param {*} appid 
   * @param {*} appsecret 
   */
  async getWxToken(appid = config.wx.appid, appsecret = config.wx.appsecret) {
    //提前 1 分钟刷新
    if(this.WxToken(appid).expires_in - 1 * 1000 * 60 > new Date().getTime()){
      return this.WxToken(appid)
    }
    let {errcode, errmsg, access_token ,expires_in} = await HTTPGet(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${appsecret}`)
    if(errcode){
      throw logger.errorMsg("WXAPI.getWxToken error", { errcode, errmsg })
    }
    return Object.assign(this.WxToken(appid), {access_token ,expires_in: new Date().getTime() + expires_in * 1000})
  },

  WxJsApiTicket(appid = config.wx.appid){
    if(!WxJsApiTicket[appid]) WxJsApiTicket[appid] = {expires_in:0}
    return WxJsApiTicket[appid]
  },

  /**
   * 获取调用微信JS接口的临时票据
   * @param {*} appid 
   * @param {*} appsecret 
   */
  async getWxJsApiTicket(appid = config.wx.appid, appsecret = config.wx.appsecret){
    //提前 1 分钟刷新
    if(this.WxJsApiTicket(appid).expires_in - 1 * 1000 * 60 > new Date().getTime()){
      return this.WxJsApiTicket(appid)
    }
    let { access_token } = await this.getWxToken(appid, appsecret)

    let {errcode, errmsg, ticket ,expires_in} = await HTTPGet(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`)
    if(errcode){
      throw logger.errorMsg("WXAPI.getWxJsApiTicket error", { errcode, errmsg })
    }
    return Object.assign(this.WxJsApiTicket(appid), {ticket ,expires_in: new Date().getTime() + expires_in * 1000})
  }, 

  
  WxCardTicket(appid = config.wx.appid){
    if(!WxCardTicket[appid]) WxCardTicket[appid] = {expires_in:0}
    return WxCardTicket[appid]
  },
  /**
   * 微信卡券接口中使用的签名凭证api_ticket
   * @param {*} appid 
   * @param {*} appsecret 
   */
  async getWxCardTicket(appid = config.wx.appid, appsecret = config.wx.appsecret){
    //提前 1 分钟刷新
    if(this.WxCardTicket(appid).expires_in - 1 * 1000 * 60 > new Date().getTime()){
      return this.WxCardTicket(appid)
    }
    let { access_token } = await this.getWxToken(appid, appsecret)

    let {errcode, errmsg, ticket ,expires_in} = await HTTPGet(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=wx_card`)
    if(errcode){
      throw logger.errorMsg("WXAPI.WxCardTicket error", { errcode, errmsg })
    }
    return Object.assign(this.WxCardTicket(appid), {ticket ,expires_in: new Date().getTime() + expires_in * 1000})
  }, 

  /**
   * 获取微信JS-API 接口调用签名
   * 签名用的noncestr和timestamp必须与wx.config中的nonceStr和timestamp相同。
   * 签名用的url必须是调用JS接口页面的完整URL。
   * @param {*} noncestr 随机字符串 需要与页面  
   * @param {*} timestamp 时间戳
   * @param {*} url 需要调用JSAPI接口的页面URL
   * @param {*} appid 公众号的 APPID
   * @param {*} appsecret 公众号的密钥
   */
  async getWxJSApiSignature(noncestr, timestamp, url, appid = config.wx.appid, appsecret = config.wx.appsecret){
    let { ticket } = await this.getWxJsApiTicket(appid, appsecret)
    return SHA1(`jsapi_ticket=${ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`)
  }, 

  /**
   * 获取微信卡劵 接口调用签名
   * @param {*} noncestr 
   * @param {*} timestamp 
   * @param {*} url 
   * @param {*} appid 
   * @param {*} appsecret 
   */
  async getWxCardSignature(noncestr, timestamp, url, appid = config.wx.appid, appsecret = config.wx.appsecret){
    let { ticket } = await this.getWxCardTicket(appid, appsecret)
    return SHA1(`jsapi_ticket=${ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`)
  }, 

  /**
   * 获取临时素材
   * @param {*} media_id 
   * @param {*} appid 
   * @param {*} appsecret 
   */
  getTemporaryMedia(media_id, appid = config.wx.appid, appsecret = config.wx.appsecret){
    return new Promise(async (resolve, reject) => {
      let { access_token } = await this.getWxToken(appid, appsecret) 
      HTTPGet(`https://api.weixin.qq.com/cgi-bin/media/get?access_token=${access_token}&media_id=${media_id}`, "binary").then((data, headers) => {
        if(data.errcode) {
          reject(logger.errorMsg("WXAPI-getTemporaryMedia", data))
        }
        resolve({
          data, filename: media_id
        })
      })
      .catch(reject)
    })
  }, 

  /**
   * 获取微信用户信息
   * @param {*} access_token 微信授权 Token [getWxToken]
   * @param {*} openid 
   */
  async getWxUserInfo(access_token, openid) {
    return await HTTPGet(`https://api.weixin.qq.com/cgi-bin/user/info?access_token=${access_token}&openid=${openid}&lang=zh_CN`)
  },
  /**
   * 获取微信小程序二维码
   * @param {*} access_token 微信授权 Token [getWxToken]
   * @param {*} params 
   * @returns binary
   */
  async getWxGameRQCode(access_token, params = {}) {
    return await HTTPPost(`https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${access_token}`, params, "binary")
  }
}

// 话费 京东购物券 淘宝购物券 福利彩票 刮刮乐 现金 游戏礼包

/**
 * 聚合数据 API
 */
export const JUHEAPI = {
  OPENID: "JH9589f0151131e6a452d275a135f9b8d5",
  /**
   * 发送短信验证码
   * @param {String} mobile 手机号码
   * @param {String} code 验证码 [4~8] 位
   * @param {String} tpl_id 短信模板
   * @param {String} key API KEY
   */
  async sendSmSCode(mobile, code, tpl_id = 159499, key = "062c94b3a5bfb03c8ff250b81c8f9fcf") {
    let data = await HTTPGet(`https://v.juhe.cn/sms/send?mobile=${mobile}&tpl_id=${tpl_id}&tpl_value=${encodeURIComponent(`#code#=${code}`)}&key=${key}`)
    if (data.error_code == 0) {
      logger.info(data)
      return true
    }
    throw logger.errorMsg("JUHEAPI.sendSmSCode error", { data })
    return false
  },

  /**
   * 身份证实名认证
   * @param {*} idcard 
   * @param {*} realname 
   * @param {*} key 
   */
  async realNameAuthentication(idcard, realname, key = "be8c4ebe6a6614b117f3454e718b6c3a") {
    let data = await HTTPGet(`https://op.juhe.cn/idcard/query?key=${key}&idcard=${idcard}&realname=${encodeURIComponent(realname)}`)
    if (data.result && data.result.res == 1) {
      logger.info(data)
      return true
    }
    logger.error(data)
    return false
  },

  /**
   * 获取银行卡信息辨别真伪
   * @param {*} bank_card 银行卡号
   * @param {*} key 
   */
  async bankCardInfo(bank_card, key = "912c6bf687c5e500d6fc7562daed2d51") {
    let data = await HTTPGet(`https://v.juhe.cn/bankcardinfo/query?key=${key}&bankcard=${bank_card}`)
    if (data.error_code == 0) {
      logger.info(data)
      return {
        bank: "",
        cardtype: "",
        nature: "",
        kefu: "",
        bankcard: "",
        logo: "",
        info: "",
        ...data.result
      }
    }
    logger.error(data)
    return false
  },

  /**
   * 银行卡校验四要素
   * @param {*} mobile 手机号码 
   * @param {*} idcard 身份证号
   * @param {*} realname 真实姓名
   * @param {*} bankcard 银行卡号
   * @param {*} key 
   */
  async verifyBankCard4(mobile, idcard, realname, bankcard, key = "a76130d96515b4de7391d037ff93661a") {
    let data = await HTTPGet(`https://v.juhe.cn/verifybankcard4/query.php?key=${key}&bankcard=${bankcard}&realname=${encodeURIComponent(realname)}&idcard=${idcard}&mobile=${mobile}`)
    if (data.result && data.result.res == 1) {
      logger.info(data)
      return {
        jobid: "",/*本次查询流水号*/
        realname: "",/*姓名*/
        bankcard: "",/*银行卡卡号*/
        idcard: "",/*身份证号码*/
        mobile: "",/*预留手机号码*/
        res: "",/*验证结果，1:匹配 2:不匹配*/
        message: ""/*描述*/,
        ...data.result
      }
    }
    logger.error(data)
    return false
  },
  /**充值 */
  Recharge: {
    mobile: {
      /**
       * 检查号码是否可以充值
       * @param {*} cardnum 
       * @param {*} phoneno 
       * @param {*} key 
       */
      async telcheck(cardnum, phoneno, key = "ddb7bf0bc19fe6e2eec2878a9caddb33") {
        let data = await HTTPGet(`https://op.juhe.cn/ofpay/mobile/telcheck?cardnum=${cardnum}&phoneno=${phoneno}&key=${key}`)
        if (data.error_code == 0) {
          logger.info(data)
          return true;
        }
        logger.error(data)
        return false
      },

      /**
       * 在线直充 
       * @param {*} cardnum 
       * @param {*} phoneno 
       * @param {*} orderid 
       * @param {*} key 
       */
      async onlineorder(cardnum, phoneno, orderid, key = "ddb7bf0bc19fe6e2eec2878a9caddb33") {
        let sign = MD5(JUHEAPI.OPENID + key + phoneno + cardnum + orderid)
        let data = await HTTPGet(`https://op.juhe.cn/ofpay/mobile/onlineorder?key=${key}&phoneno=${phoneno}&cardnum=${cardnum}&orderid=${orderid}&sign=${sign}`)
        if (data.error_code == 0) {
          logger.info(data)
          return {
            cardid: "", /*充值的卡类ID*/
            cardnum: "1", /*数量*/
            ordercash: 0, /*进货价格*/
            cardname: "", /*充值名称*/
            sporder_id: "", /*聚合订单号*/
            uorderid: "",/*商户自定的订单号*/
            game_userid: "", /*充值的手机号码*/
            game_state: "0" /*充值状态:0充值中 1成功 9撤销，刚提交都返回0*/,
            ...data.result
          }
        }
        logger.error(data)
        return false
      },
      /**
       * 查询订单状态
       * @param {*} orderid 商家Order_ID 
       * @param {*} kety 
       */
      async ordersta(orderid, kety = "ddb7bf0bc19fe6e2eec2878a9caddb33") {
        let data = await HTTPGet(`https://op.juhe.cn/ofpay/mobile/ordersta?key=${key}&orderid=${orderid}`)
        if (data.error_code == 0) {
          logger.info(data)
          return {
            "uordercash": "5.000", /*订单扣除金额*/
            "sporder_id": "20150511163237508",/*聚合订单号*/
            "game_state": "1" /*状态 1:成功 9:失败 0：充值中*/,
            ...data.result
          }
        }
        logger.error(data)
        return false
      }

    },


  }
}

/**京东云API */
export const JDCLOUD = {
  get APPKEY() {
    return "02faeb3ec4022ab4dd0fc56a63a678f9"
  },
  /**
   * 银行卡四要素校验
   * @param {*} name 真实姓名
   * @param {*} idCard 身份证号
   * @param {*} mobile 手机号码
   * @param {*} accountNo 银行卡号
   */
  async verifyBankCard4(mobile, idCard, name, accountNo) {
    let data = await HTTPGet(`https://way.jd.com/fegine/b4bcert?name=${encodeURIComponent(name)}&idCard=${idCard}&mobile=${mobile}&accountNo=${accountNo}&appkey=${this.APPKEY}`)
    if (data.result && data.result.status == "01") {
      logger.info(data)
      return {
        /**状态码:01 验证通过；02 验证不通过；详见状态码说明 */
        status: "",
        /**验证信息提示 */
        msg: "",
        /**身份证号 */
        idCard: "",
        /**银行卡号 */
        accountNo: "",
        /**银行名称 */
        bank: "",
        /**银行卡名称 */
        cardName: "",
        /**银行卡类型 */
        cardType: "",
        /**姓名 */
        name: "",
        /**电话 */
        mobile: "",
        /**性别 */
        sex: "",
        /**身份证所在地址 */
        area: "",
        /**省 */
        province: "",
        /**市 */
        city: "",
        /**区县 */
        prefecture: "",
        /**出生年月 */
        birthday: "",
        /**地区代码 */
        addrCode: "",
        /**校验码 */
        lastCode: "",
        /** */
        ...data.result
      }
    }
    logger.error(data)
    return false
  }, 
  
}

export const FACEPLUSPLUS = {
  /**
   * 人脸融合
   * 图片大小必须小于 2M
   * @param {*} merge_url 人脸图片
   * @param {*} template_url 要融合的模板 
   * @param {*} merge_rate 融合度
   * @param {*} api_key 
   * @param {*} api_secret 
   */
  async mergeface(merge_url, template_url, merge_rate = 50, api_key = ["tHx-70cNGAznQc7VmaBf0eKexpZMEYPo","LVxCB1_ySFin18wwwUOApROeIU_yhNks"][1], api_secret = ["oHAc_BCdHZoZcFd9J4P7gkSm0vxIpZiN","y9RhsGziehe6Vd7ZK8wclPOEKypam0Ik"][1]){
    let formdata = new FormData()
    formdata.append("api_key", api_key)
    formdata.append("api_secret", api_secret)
    formdata.append("merge_url", merge_url)
    formdata.append("template_url", template_url)
    formdata.append("merge_rate", merge_rate)
    let data = await HTTPPost("https://api-cn.faceplusplus.com/imagepp/v1/mergeface", formdata)
    if(data.error_message){
      return logger.error(data)
    }
    return data.result
  }
}