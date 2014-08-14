var User = require('../models/user.js'); //引入用户登录函数
module.exports = function(io) {
	//存储在线用户列表
	var users = [];
	io.sockets.on('connection', function(socket) {
		socket.on('online', function(data) {
			if (data != null) {
				//将上线的用户名存储为 socket 对象的属性，以区分每个 socket 对象，方便后面使用
				socket.name = data.user;
				//数组中不存在该用户名则插入该用户名
				if (users.indexOf(data.user) == -1) {
					users.unshift(data.user);
				}
				//向所有用户广播该用户上线信息
				io.sockets.emit('online', {
					users: users,
					user: data.user
				});
			}
		});
		//接受用户下线通知
		socket.on('disconnect', function() {
			//若 users 数组中保存了该用户名
			if (users.indexOf(socket.name) != -1) {
				//从 users 数组中删除该用户名
				users.splice(users.indexOf(socket.name), 1);
				//向其他所有用户广播该用户下线信息
				socket.broadcast.emit('offline', {
					users: users,
					user: socket.name
				});
			}
		});
		//私信聊天
		socket.on('Talk', function(data, fn) {
			var time = new Date().Format("yyyy-MM-dd hh:mm:ss");
			var header = "";
			User.get(data.from, function(err, user) {
				header = user.imgUrl
				//返回发送者的返回函数
				fn({
					msg: "ok",
					time: time,
					header: header
				});
				//推送其他客户端
				var clients = io.sockets.clients();
				clients.forEach(function(client) {
					if (client.name == data.to) {
						// var newtime=new Date();
						// newtime.setMinutes(newtime.getMinutes() + 1200);
						// data.time = newtime.Format("yyyy-MM-dd hh:mm:ss");
						data.time = time;
						data.header = header;
						//触发该用户客户端的 Talk 事件
						client.emit('Talk', data);
					}
				});

			});
		});
	});
};
Date.prototype.Format = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份 
		"d+": this.getDate(), //日 
		"h+": this.getHours(), //小时 
		"m+": this.getMinutes(), //分 
		"s+": this.getSeconds(), //秒 
		"S": this.getMilliseconds() //毫秒 
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}