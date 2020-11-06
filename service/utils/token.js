import jwt from "jsonwebtoken"

const secret = 'shenzhenshichunqiuwangluokejiyouxianggong';

/**
 * 创建 Token 
 * @param {*} data 要携带的信息 
 * @param {String} expiresIn 有效期
 */
export const createToken = (data = {}, expiresIn = "2d") => {
  return jwt.sign(data, secret, { expiresIn });
}

/**
 * 校验 Token 
 * @param {String} token 
 */
export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (error, decoded) => {
      if (error) {
        return reject(error)
      }
      return resolve(decoded);
    });
  })
};
