require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const {expressjwt} = require('express-jwt');
const i18n = require('./config/i18n');


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


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(i18n.init);

app.use((req, res, next)=>{
  res.locals.locale = req.getLocale();
  next();
});

// Agregado clase 17/octubre
// middleware para solicitar el token en cada ruta a excepcion: .unless la ruta del login
const SECRET_KEY = process.env.SECRET_KEY

//app.use(expressjwt({secret: SECRET_KEY, algorithms:["HS256"]}).
//unless({path:['/api/auth/login', '/health', '/']}));


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

// error handler (cambiado para soportar traducciones de errores)
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  const status = err.status || 500;

  if (err.name === 'UnauthorizedError'){
    res.locals.message = req.__("auth.unauthorized"); // Error 401
  } else if (status === 403) {
    res.locals.message = req.__("errors.forbidden"); // Error 403
  } else if (status === 404) {
    res.locals.message = req.__("errors.notFound"); // Error 404
  } else if (status === 500) {
    res.locals.message = req.__("errors.internal"); // Error 500
  } else {
    res.locals.message = err.message;
  }
  
  
  res.locals.status = status;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(status);
  res.render('error');
});

module.exports = app;
