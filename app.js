require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const {expressjwt} = require('express-jwt');


var indexRouter = require('./routes/api/index');
var usersRouter = require('./routes/api/users');
const rolesRouter = require('./routes/api/roles');
const permissionsRouter = require('./routes/api/permissions');
const productsRouter = require('./routes/api/products');
const variantsRouter = require('./routes/api/variants');
const inventoryRouter = require('./routes/api/inventory');
const ordersRouter = require('./routes/api/orders');
const customersRouter = require('./routes/api/customers');
const authRouter = require('./routes/api/auth');

const indexWebRouter = require('./routes/web/index');

var app = express();

// Agregado clase 17/octubre
// middleware para solicitar el token en cada ruta a excepcion: .unless la ruta del login
const SECRET_KEY = process.env.SECRET_KEY

//app.use(expressjwt({secret: SECRET_KEY, algorithms:["HS256"]}).
//unless({path:['/api/auth/login', '/health', '/']}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



// agregado clase 31/octubre
// empezamos a separar el api de lo que es la parte de app web
app.use('/', indexWebRouter);
app.use('/health',indexRouter);

// agregado en la clase 10/octubre
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/permissions', permissionsRouter);
app.use('/api/products', productsRouter);
app.use('/api/variants', variantsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
