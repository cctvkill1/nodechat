
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');
var sock= require('./models/socket');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(flash());
app.use(express.favicon());
app.use(express.logger('dev'));
// app.use(express.bodyParser({uploadDir:'./uploads'}));
//下面2句替代上面一句 
app.use(express.urlencoded());
app.use(express.json());

app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
  secret: settings.cookieSecret,
  key: settings.db,
  //cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  cookie: {maxAge: 1000 * 60 * 60 * 1},//1小时
  store: new MongoStore({
    db: settings.db
  })
}));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.router(routes)); 


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


var server = http.createServer(app);
var io = require('socket.io').listen(server);
//socket 通信
sock(io);//执行socket.js里面的内容

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

routes(app);