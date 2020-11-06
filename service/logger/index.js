import log4js from "log4js"

log4js.configure({
  appenders:{
    console:{type: "console"},
    dateFile:{
      type: 'dateFile',
      filename: './logs/app.log', // 需要手动创建此文件夹
      pattern: '.yyyy-MM-dd',
      //包含模型
      alwaysIncludePattern: true,
      keepFileExt:true,
      compress:true,
      category: 'console'
    }
  },
  categories:{
    default:{
      appenders:["dateFile", "console"],
      level:log4js.levels.ALL
    }
  },
  replaceConsole: true // 替换 console.log
})

export default log4js.connectLogger(log4js.getLogger(), { level: "auto", format:(req, res, format) => {
  return format(`:remote-addr | :response-time | :method | :status | :url | {req_data:${JSON.stringify({query:req.query,body:req.body,params:req.params})}, token:${req.headers.token}}}`)
}});
