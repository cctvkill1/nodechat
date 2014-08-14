var crypto = require('crypto'), //密码加密模块
  User = require('../models/user.js'); //引入用户登录函数
module.exports = function(app) {
  //http://localhost:3000/ 请求地址  
  app.get('/', function(req, res) {
    //因为登陆成功会将信息记录到session中，所有如果不存在就到登陆注册页面，如果存在就表示用户已经登陆，直接跳转到展示页面
    if (!req.session.user) {
      res.render('index', {
        title: "聊天",
        name: "聊天啊",
        user: req.session.user, //这里可以用ejs摸版的locals.user 访问到
        error: req.flash('error').toString(), //这里可以用ejs摸版的locals.error 访问到
        success: req.flash('success').toString() //这里可以用ejs摸版的locals.success 访问到
      });
    } else {
      res.redirect('/people');
    }
  });
  app.get('/chat', function(req, res) {
      res.render('chat');
  });
  app.get('/chat/:name', function(req, res) {   
    if (!req.session.user) {
      res.render('index', {
        title: "聊天",
        name: "聊天啊",
        user: req.session.user, //这里可以用ejs摸版的locals.user 访问到
        error: req.flash('error').toString(), //这里可以用ejs摸版的locals.error 访问到
        success: req.flash('success').toString() //这里可以用ejs摸版的locals.success 访问到
      });
    } else { 
      User.get(req.params.name, function(err, user){
              res.render('chat',{ 
                name:req.params.name, 
                user:req.session.user, 
                imgUrl:user.imgUrl 
          });         
      }); 
    }
  });
  //http://localhost:3000/loginout  登出请求地址
  app.get('/loginout', function(req, res) {
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');
  });
  //发送登陆信息接受地址http://localhost:3000/login
  app.post('/login', function(req, res) {
    //post过来的密码加密
    var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
      name: req.body.name,
      password: password
    });
    //查找用户
    User.get(newUser.name, function(err, user) {
      if (user) {
        //如果存在，就返回用户的所有信息，取出password来和post过来的password比较
        if (user.password != password) {
          req.flash('error', '密码不正确');
          res.redirect('/');
        } else {
          req.session.user = user;
          res.redirect('/people');
        }
      } else {
        req.flash('error', '用户不存在');
        res.redirect('/');
      }
    });
  });
  //发送注册信息接受地址http://localhost:3000/reg
  app.post('/reg', function(req, res) {
    //在post请求后的反应
    //post信息中发送过来的name,password和repassword,用req.body获取
    var name = req.body.name,
      password = req.body.password,
      password_re = req.body['repassword'];
    //后端判断两次注册的密码是否相等
    if (password_re != password) {
      //如果密码不相等，将信息记录到页面通知flash,然后跳转到http://localhost:3000/
      req.flash('error', '两次输入的密码不一致!');
      return res.redirect('/');
    }
    //对密码进行加密操作 
    var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
      name: req.body.name,
      password: password
    });
    //使用user.js中的user.get() 函数来读取用户信息
    User.get(newUser.name, function(err, user) {
      //如果有返回值，表示存在用户
      if (user) {
        err = '用户已存在!';
      }
      if (err) {
        //如果报错，记录错误信息和页面跳转
        req.flash('error', err);
        return res.redirect('/');
      }
      //使用user.js的user.save() 保存信息函数
      newUser.save(function(err, user) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        //成功后，将用户信息记录在页面间的会话req.session中，并且跳转到一个新页面，就是内容集中展示页面
        req.session.user = user;
        req.flash('success', '注册成功!');
        res.redirect('/people');
      });
    });
  });
  //http://localhost:3000/loginout  登出请求地址
  app.get('/people', function(req, res) {
     if (!req.session.user) {
      res.render('index', {
        title: "聊天",
        name: "聊天啊",
        user: req.session.user, //这里可以用ejs摸版的locals.user 访问到
        error: req.flash('error').toString(), //这里可以用ejs摸版的locals.error 访问到
        success: req.flash('success').toString() //这里可以用ejs摸版的locals.success 访问到
      });
    } else {
     User.getAll(req.session.user.name,function(err, data){
      res.render('people',{users:data,user:req.session.user});
     });
    }
  });
  //http://localhost:3000/people/xxx  xxx这个用户的展示页面
  app.get('/people/:user',function(req,res){ 
      User.get(req.params.user, function(err, user){
              res.render('user',{ 
                address: user.address, 
                company: user.company, 
                school : user.school, 
                info : user.info, 
                name:req.params.user, 
                user:req.session.user, 
                question:question, 
                imgUrl:user.imgUrl 
          });         
      }); 
  });
  //http://localhost:3000/people 修改个人资料
  app.post('/people',function(req,res){
      //头像地址
      var tmp_path,target_path;
      if(req.files.thumbnail.size>0){ //表示有图片文件上传
          tmp_path = req.files.thumbnail.path;
          // 指定文件上传后的目录 - 示例为"images"目录。
          // 重命名图片名字
          var picType=req.files.thumbnail.name.split(".");
          picType=picType[1];
          target_path = './public/images/user/pic_' + req.session.user.name+"."+picType;
          // 移动文件
          fs.rename(tmp_path, target_path, function(err) {
            if (err) throw err;
           //程序执行到这里，user文件下面就会有一个你上传的图片
            imageMagick(target_path)
            .resize(150, 150, '!') //加('!')强行把图片缩放成对应尺寸150*150！
            .autoOrient()
            .write(target_path, function(err){
              if (err) {
                console.log(err);
              }
            });
         //    images("./public/images/user/pic.jpg").size(400).save("./public/images/user/output.jpg", {
         //     quality : 7                   
         // }); 
          });
      }    
      var newUser = new User({
        name: req.session.user.name,
        address: req.body.address,
        company:req.body.company,
        school:req.body.school,
        info:req.body.info,
        imgUrl:target_path,
      });
      //更新
      newUser.updataEdit(function(err){
          if(err){
              req.flash('error',err);
              return res.redirect('/');
          }
          req.session.user = newUser;//用户信息存入session
          //req.flash('success','注册成功!');
          res.redirect('/people/'+newUser.name);
      });
  });  
};