
import https from "https";
import UUID from "uuid"
import url from "url"
import moment from "moment"
import querystring from "querystring"
import { createToken, verifyToken } from "./token";
import md5 from "md5-node"
import { getLogger } from "log4js";
import { isArray } from "util";
import { WXAPI } from "./externalAPI";
import { TIME_FORMAT } from "../models/GlobalData";
import crypto from "crypto"
import FormData from 'form-data';

const logger = getLogger("utils")

/**
 * HTTP GET 请求
 * @param {String} urlStr 请求地址
 */
export const HTTPGet = function (urlStr , encodeing = "utf8") {
  return new Promise((resolve, reject) => {
    https.request(Object.assign(url.parse(urlStr), {
      method: 'GET'
    }), res => {
      let resData = ''
      res.setEncoding(encodeing);
      res.on('data', d => resData += d);
      res.on("end", ()=>{
        try {
          resolve(JSON.parse(resData))
        } catch (error) {
          resolve(resData)
        }
      })
      res.on("error", reject)
    }).end();
  })
}
/**
 * 发送HTTP post 请求
 * @param {*} url 
 * @param {*} data 
 */
export const HTTPPost = function (urlStr, data, encodeing = "utf8") {
  return new Promise((resolve, reject) => {
    let is_FormData = data instanceof FormData
    //需要发送的参数
    let post_data = JSON.stringify(data)
    let options = Object.assign(url.parse(urlStr), {
      method: 'POST',
      headers: is_FormData ? data.getHeaders() : {
        'Content-Length': Buffer.byteLength(post_data),
        'Content-Type': 'application/json',
      }
    });
    //建立http请求
    let post_req = https.request(options, (res) => {
      let resData = '';
      res.setEncoding(encodeing);
      res.on('data', d => resData += d);
      res.on("end", ()=>{
        try {
          resolve(JSON.parse(resData))
        } catch (error) {
          resolve(resData)
        }
      })
    }).on('error', reject);
    //在这里写入需要发送的参数
    if(is_FormData){
      data.pipe(post_req);
    }
    else {
      post_req.write(post_data);
      post_req.end();
    }
  })
}

/**
 * 
 */
export const GenId = function () {
  return UUID.v1().toLocaleUpperCase();
}

export const OrderId = function(){
  return moment().format("YYYYMMDDHHmmssSSS").concat(String(Math.random()).substr(-13))//.split("").sort(e => .5 - Math.random()).join("") //经测试去掉这部分生成[1000000]个随机字符串仅需要[1196.651123046875ms]同样没有重复,但是有明显规则
}

/**获取现在时间 */
export const CreateTime = function () {
  return moment().format(TIME_FORMAT)
}

/**Token */
export const Token = {
  createTokenByid: id => createToken({ id }),
  verifyTokenToid: async token => {
    let data = await verifyToken(token)
    return data.id
  },
  createToken,
  verifyToken
}
/**
 * MD5 加密
 * @param {*} str 
 */
export const MD5 = function (str = "") {
  return md5(str)
}

/**
 * SHA1 加密
 * @param {*} str 
 */
export const SHA1 = function(str = ""){
  return crypto.createHash("sha1").update(str).digest("hex")
}

/**
 * 随机函数
 */
export const Random = {

  /**
   * 生成指定范围的数
   * @param {*} min 
   * @param {*} max 
   */
  rangeNumber(min = 1, max = 10) {
    return parseInt(Math.random() * (max - min + 1) + min, 10);
  },

  /**
   * 生成指定长度的数
   * @param {*} len 
   */
  lengthNumber(len = 8) {
    const nums = "0123456789";
    let lenNums = "";
    for (let i = 0; i < len; i++) {
      let n = this.rangeNumber(0, nums.length - 2)
      lenNums += nums.substr(n, 1);
    }
    return lenNums;
  }, 
  lengthLetterAndNumber(len = 4){
    const nums = "0123456789qwertyuiopasdfghjklzxcvbnm";
    let lenNums = "";
    for (let i = 0; i < len; i++) {
      let n = this.rangeNumber(0, nums.length - 2)
      lenNums += nums.substr(n, 1);
    }
    return lenNums;
  }
}
/**
 * 是否为空
 * @param {*} any 
 */
export const isBlank = function (any, keys = null) {
  switch (typeof (any)) {
    case "string": {
      return /^\s*$/.test(any) || "null" == any || "undefined" == any || "NaN" == any;
    }
    case "object": {
      if (isArray(any)) {
        return any.length == 0;
      }
      if (keys && isArray(keys)) {
        for (let key of keys) {
          if (isBlank(any[key])) {
            return key
          }
        }
      }
    }
  }
  return JSON.stringify(any) == "{}" || any == null || any == undefined || any == NaN;
}

/**
 * 屏蔽字符串
 * @param {*} str 要屏蔽的字符串
 * @param {*} start 保留开始的几位
 * @param {*} end 保留结尾的几位
 * @param {*} splice 替换的符号
 */
export const screenString = function(str = "", start = 4, end = 4, splice = "*"){
  str = String(str)
  let len = str.length
  let slen = str.length - start - end 
  return str.substr(0, start).concat(splice.repeat(slen >= 0 ? slen : 0)).concat(len > start ? str.substr(-(slen >= 0 ? end : len - start), end) : "")
}
