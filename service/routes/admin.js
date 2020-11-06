'use strict'

import express from 'express'
import AdminControllter from '../controller/AdminControllter'

const admin = express.Router()

admin.post("/login", AdminControllter.login)
admin.post("/modifyAdministratorPassword", AdminControllter.modifyAdministratorPassword)
admin.get("/savePhone", AdminControllter.savePhone)
admin.get("/findPhone", AdminControllter.findPhone)
admin.get("/sendMsg", AdminControllter.sendMsg)

export default admin

