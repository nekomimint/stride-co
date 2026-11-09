// This load all env and secrets to config
const config = require('config');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { expressjwt } = require('express-jwt');
// agregado clase 23/oct
const i18n = require('./config/i18n');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const rolesRouter = require('./routes/roles');
const permissionsRouter = require('./routes/permissions');
const productsRouter = require('./routes/products');
const variantsRouter = require('./routes/variants');
const inventoryRouter = require('./routes/inventory');
const ordersRouter = require('./routes/orders');
const customersRouter = require('./routes/customers');
const authRouter = require('./routes/auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// agregado 28/octubre
app.use(i18n.init);

// Le pasa el idioma a las vistas 
app.use((req, res, next) => {
  res.locals.locale = req.getLocale();
  next();
});

// Endpoint explicito de Health Check (publico)
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Middleware JWT con excepcion para login y health
const SECRET_KEY = config.get("auth.jwtSecret");
app.use(
  expressjwt({ secret: SECRET_KEY, algorithms: ["HS256"] }).unless({
    path: [
      '/api/auth/login',
      '/auth/login',
      '/health',
      '/api/health'
    ]
  })
);

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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler (cambiado para soportar traducciones de errores)
app.use(function(err, req, res, next) {
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
  
  // Si la petición es JSON (ej. peticiones de la API o E2E), responde en JSON
  if (req.accepts('json') || (req.path && req.path.startsWith('/api')) || req.xhr) {
    return res.status(status).json({
      error: res.locals.message,
      message: res.locals.message,
      status: status
    });
  }

  // render the error page 
  res.status(status);
  res.render('error');
});

module.exports = app;
