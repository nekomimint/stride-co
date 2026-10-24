require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const {expressjwt} = require('express-jwt');
// agregado clase 23/oct
const i18n = require('./config/i18n');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const rolesRouter = require('./routes/roles');
const permissionsRouter = require('./routes/permissions');
const productsRouter = require('./routes/products');
const variantsRouter = require('./routes/variants');
const inventoryRouter = require('./routes/inventory');
const customersRouter = require('./routes/customers');
const ordersRouter = require('./routes/orders');
const authRouter = require('./routes/auth');

var app = express();

// Agregado clase 17/octubre
// middleware para solicitar el token en cada ruta a excepcion: .unless la ruta del login
const SECRET_KEY = process.env.SECRET_KEY

//app.use(expressjwt({secret: SECRET_KEY, algorithms:["HS256"]}).unless({path:['/api/auth/login']}));

app.use(
  expressjwt({ secret: SECRET_KEY, algorithms: ["HS256"] }).unless({
    path: [
      '/api/auth/login',
      { url: '/api/users', methods: ['POST'] } // Permite crear usuarios sin pedir token
    ]
  })
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// agregado 28/octubre
// tiene que ser en este punto para que haya pasado primero por cookieParser()
// inyecta el objeto i18n para poder usarl EN CADA CONTROLADOR
// a esto se le llama inyeccion de dependencias
app.use(i18n.init)

app.use('/', indexRouter);
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
app.use('/', indexRouter);
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
