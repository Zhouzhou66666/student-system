const express = require('express')
// const fs = require('fs')
const session=require('express-session')

const router=require('./router')
//程序员自开发的模块，必须以./或../开头
//node遇到非./或者非../开头的模块，会自动到node_modules里面去查找

//模块化开发
const app = express()

//借助express-art-template才可以解析html文件
app.engine('html', require('express-art-template'))

//开放静态文件
app.use('/node_modules', express.static('./node_modules'))
app.use('/public', express.static('./public'))

//配置body-parser,之后才能用req.body接收前端post来的数据
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use(session({
    secret:"ksasdhajshdakj,",//设置签名密钥，内容可以任意填写
    cookie:{maxAge:5*60*1000},//设置cookie过期时间，即5min后在登陆需要密码
    resave:true,//强制保存，如果session没有呗修改也要重新保存
    rolling:true,  //5min内进入过系统则重新计时
    saveUninitialized:true
}))


app.use(router)

app.listen(3000, () => console.log('app is running...'))