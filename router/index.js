const express = require('express')
const fs = require('fs')

const router = express.Router()//路由，代表一种映射关系

//渲染管理员页面
router.get('/admin-login.html', (req, res) => {
    if (req.session.admin) {
        res.redirect('/admin-student-message.html')
        return
    }
    res.render('admin-login.html')
})

//渲染管理员查看学生信息界面
router.get('/admin-student-message.html', (req, res) => {
    const admin = req.session.admin
    if (admin) {
        delete admin.password
        fs.readFile('data/students-message.json', (error, data) => {
            if (error) throw error
            const result = {
                // admin:admin
                admin,
                studentsMessage: JSON.parse(data)
            }
            result.studentsMessage.forEach(item=>delete item.password)
            res.render('admin-student-message.html', {result})
        })
    } else {
        res.redirect('/admin-login.html')
    }
})

//渲染管理员添加学生界面
router.get('/admin-add-student.html', (req, res) => {
    const admin = req.session.admin
    if (admin) {
        delete admin.password
        res.render('admin-add-student.html', {admin})
    } else {
        res.redirect('/admin-login.html')
    }
})

//渲染修改学生界面
router.get('/admin-edit-student.html', (req, res) => {
    const admin = req.session.admin
    if (admin) {
        delete admin.password
        fs.readFile('data/students-message.json', (error, data) => {
            if (error) throw error
            const student = JSON.parse(data).find(item => item.account == req.query.account)
            const result = {
                admin
            }
            if (student) {
                delete student.password
                result.student = student
            }
            res.render('admin-edit-student.html', {result})
        })
    } else {
        res.redirect('/admin-login.html')
    }
})

//渲染添加管理员页面
router.get('/administrator-add.html', (req, res) => {
    const admin = req.session.admin
    if (admin) {
        delete admin.password
        res.render('administrator-add.html', {admin})
    } else {
        res.redirect('/admin-login.html')
    }
})

//渲染修改管理员界面
router.get('/administrator-edit.html', (req, res) => {
    const admin = req.session.admin
    if (admin) {
        delete admin.password
        fs.readFile('data/administrators.json', (error, data) => {
            if (error) throw error
            const administrator = JSON.parse(data).find(item => item.account == req.query.account)
            const result = {
                admin
            }
            if (administrator) {
                delete administrator.password
                result.administrator = administrator
            }
            res.render('administrator-edit.html', {result})
        })
    } else {
        res.redirect('/admin-login.html')
    }
})

//渲染超级管理员查看管理员信息界面
router.get('/administrators-message.html', (req, res) => {
    const admin = req.session.admin
    if (admin) {
        delete admin.password
        fs.readFile('data/administrators.json', (error, data) => {
            if (error) throw error
            // const result = {
            //     // admin:admin
            //     admin,
            //     studentsMessage: JSON.parse(data)
            // }
            const administrator=JSON.parse(data)
            administrator.forEach(item=>delete item.password)
            console.log(administrator)
            const result={
                admin,
                administrator,
                studentsMessage: JSON.parse(data)
            }
            res.render('administrators-message.html', {result})
        })
    } else {
        res.redirect('/admin-login.html')
    }
})

/***************************************************************************************************/

router.post('/admin-login', (req, res) => {//回调函数callback
    console.log(req.body)
    fs.readFile('data/administrators.json', (error, data) => {//异步
        if (error) throw error
        //console.log(JSON.parse(data))
        const administrator = JSON.parse(data).find(item => item.account == req.body.account)
        if (!administrator || !administrator.incumbency) {
            const message = {warning: "账号不存在"}
            res.render('admin-login-error.html', {message})
            return
        }
        if (administrator.password == req.body.password) {
            fs.readFile('data/permissions.json', (error, data) => {
                if (error) throw error
                const permissions = JSON.parse(data)//超级，普通，学生
                /*let result={
                    permission:permissions.admin
                }
                //result.permission=perminssions.admin//普通管理员权限赋值给result.permission
                if(administrator.isSupperAdmin){//如果是超级管理员，则把超级权限也添加给result.permission
                    //console.log(perminssions)
                    /!*for (let i=0;i<permissions.superAdmin.length;i++){
                        result.permission.push(permissions.superAdmin[i])
                    }*!/
                   /!* for (item of perminssions.superAdmin){
                        result.permission.push(item)
                    } *!/
                    result.permission =result.permission.concat(permissions.superAdmin)
                }*/

                administrator.permission = administrator.isSuperAdmin ? permissions.admin.concat(permissions.superAdmin) : permissions.admin

                // res.render('admin-student-message.html',{result})
                // console.log(administrator)
                req.session.admin = administrator
                res.redirect('/admin-student-message.html')//跳转到router.get(/admin-student-message.html)
            })
        } else {
            const message = {warning: "账号或密码错误"}
            res.render('admin-login-error.html', {message})
        }
    })
})

router.get('/test-account', (req, res) => {
    console.log(req.query)
    fs.readFile('data/students-message.json', (error, data) => {
        if (error) throw error
        /*if (aaa){
            res.send(true)
        }else{
            res.send(false)
        }*/
        res.send(Boolean(JSON.parse(data).find(item => item.account == req.query.account)))
    })
})

router.get('/test-account2', (req, res) => {
    console.log(req.query)
    fs.readFile('data/administrators.json', (error, data) => {
        if (error) throw error
        /*if (aaa){
            res.send(true)
        }else{
            res.send(false)
        }*/
        res.send(Boolean(JSON.parse(data).find(item => item.account == req.query.account)))
    })
})

//处理管理员添加学生数据
router.get('/add-student', (req, res) => {
    // console.log(req.query)
    //验证，非常严格的验证，否则对数据库是异常巨大灾难
    const newStudent = {...req.query}//ES6对象解构赋值，意思是把req.query中的属性都复制到newStudent
    // console.log(newStudent)
    newStudent.password = '123456'
    fs.readFile('data/students-message.json', (error, data) => {
        if (error) throw error
        const students = JSON.parse(data)
        newStudent.id = String(Number(students[students.length - 1].id) + 1)
        if (!Array.isArray(newStudent.hobbies)) {
            newStudent.hobbies = newStudent.hobbies.split(',')
        }
        // console.log(newStudent)
        students.push(newStudent)
        // console.log(students)
        fs.writeFile('data/students-message.json', JSON.stringify(students), (error) => {
            if (error) throw error
            res.redirect('/admin-student-message.html')
        })
    })
})

//处理管理员修改学生数据
router.get('/edit-student', (req, res) => {
    console.log(req.query)
    fs.readFile('data/students-message.json', (error, data) => {
        if (error) throw error
        const students = JSON.parse(data)
        const index = students.findIndex(item => item.id === req.query.id)
        //方法一
        /*const student=students[index]
        student.name=req.query.name
        students.age=req.query.age
        students.account=req.query.account
        students.gender=req.query.gender
        students.hobbies=Array.isArray(req.query.hobbies)?req.query.hobbies:req.query.hobbies.split(',')
        console.log(student,'student')
        students.splice(index,1,student)*/

        // 方法二
        /*students[index].name=req.query.name
        students[index].age=req.query.age
        students[index].account=req.query.account
        students[index].gender=req.query.gender
        students[index].hobbies=Array.isArray(req.query.hobbies)?req.query.hobbies:req.query.hobbies.split(',')*/

        //方法三
        students[index] = {...req.query}//ES6对象的解构赋值，是把req.query里的每一项都复制给students[index]
        students[index].hobbies = Array.isArray(req.query.hobbies) ? req.query.hobbies : req.query.hobbies.split(',')
        // console.log('students')

        fs.writeFile('data/students-message.json', JSON.stringify(students), error => {
            if (error) throw error
            res.redirect('/admin-student-message.html')
        })
    })
})

//处理删除学生请求
router.get('/admin-delete-student', (req, res) => {
    console.log(req.query)
    fs.readFile('data/students-message.json', (error, data) => {
        if (error) throw error
        const students = JSON.parse(data)
        const index = students.findIndex(item => item.account === req.query.account)
        students.splice(index, 1)
        fs.writeFile('data/students-message.json', JSON.stringify(students), error => {
            if (error) throw error
            res.redirect('admin-student-message.html')
        })
    })
})

//处理超级管理员添加管理员数据
router.get('/add-administrator', (req, res) => {
    // console.log(req.query)
    //验证，非常严格的验证，否则对数据库是异常巨大灾难
    const newAdministrator = {...req.query}//ES6对象解构赋值，意思是把req.query中的属性都复制到newAdministrator
    // console.log(newAdministrator)
    newAdministrator.password = 'abcdefg'
    fs.readFile('data/administrators.json', (error, data) => {
        if (error) throw error
        const administrators = JSON.parse(data)
        newAdministrator.id = String(Number(administrators[administrators.length - 1].id) + 1)
        newAdministrator.isSuperAdmin=req.query.isSuperAdmin=='true'?true:false
        newAdministrator.incumbency=req.query.incumbency=='true'?true:false
        /*if (!Array.isArray(newAdministrator.hobbies)) {
            newAdministrator.hobbies = newAdministrator.hobbies.split(',')
        }*/
        // console.log(newAdministrator)
        administrators.push(newAdministrator)
        // console.log(students)
        fs.writeFile('data/administrators.json', JSON.stringify(administrators), (error) => {
            if (error) throw error
            res.redirect('/administrators-message.html')
        })
    })
})

//修改管理员数据
router.get('/edit-administrator', (req, res) => {
    console.log(req.query)
    fs.readFile('data/administrators.json', (error, data) => {
        if (error) throw error
        const administrators = JSON.parse(data)
        const index = administrators.findIndex(item => item.id === req.query.id)
        administrators[index] = {...req.query}//ES6对象的解构赋值，是把req.query里的每一项都复制给students[index]
        administrators[index].isSuperAdmin=req.query.isSuperAdmin=='true'?true:false
        administrators[index].incumbency=req.query.incumbency=='true'?true:false
        // console.log('administrators')
        fs.writeFile('data/administrators.json', JSON.stringify(administrators), error => {
            if (error) throw error
            res.redirect('/administrators-message.html')
        })
    })
})


//处理删除管理员请求
router.get('/administrator-delete', (req, res) => {
    console.log(req.query)
    fs.readFile('data/administrators.json', (error, data) => {
        if (error) throw error
        const administrators = JSON.parse(data)
        const index = administrators.findIndex(item => item.account === req.query.account)
        administrators.splice(index, 1)
        fs.writeFile('data/administrators.json', JSON.stringify(administrators), error => {
            if (error) throw error
            res.redirect('administrators-message.html')
        })
    })
})

//管理员界面查找学生
router.get('/search-student',(req,res)=>{
    console.log(req.query)
    fs.readFile('data/students-message.json',(error,data)=>{
        if (error) throw error
        const student=JSON.parse(data).find(item=>item.account==req.query.account)
        if (student){
            delete student.password
        }
        res.send(student)
    })

})
module.exports = router