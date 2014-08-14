
exports.list = function(req, res){
  res.render("users",{ title:    '用户列表',
  users:[{name: 'one' ,age:11},{name: 'two' ,age:22}]
  });
};