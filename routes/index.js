var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);
var logger = require('../lib/logger');

keystone.pre('routes', middleware.initLocals);
keystone.pre('routes', middleware.initErrorHandlers);
keystone.pre('routes', middleware.requireUser);

var routes = {
  views: importRoutes('./views'),
  api: importRoutes('./api')
};

exports = module.exports = function (app) {
  app.get('/', routes.views.home);
  app.get('/venue', routes.views.venue);
  app.get('/hotels', routes.views.hotels);
  app.get('/sponsors', routes.views.sponsors);
  app.get('/agenda', routes.views.agenda);
  app.get('/schedule', routes.views.schedule);
  app.get('/code-of-conduct', routes.views.coc);
  // app.all('/talks', routes.views.cft);
  // app.all('/workshops', routes.views.cfw);
  app.all('/lightnings', routes.views.cfl);
  app.get('/blog/:category?', routes.views.blog);
  app.get('/blog/post/:post', routes.views.post);
  app.all('/purchase/:order?', routes.views.purchase);
  app.get('/receipt/:ref', routes.views.receipt);
  app.get('/print/:ref', routes.views.print);
  app.get('/registration', routes.views.registration);

  app.all('/api*', keystone.middleware.api);
  app.get('/api/tickets/available', routes.api.tickets.available);
  app.post('/api/tickets/select', routes.api.tickets.select);
  app.post('/api/tickets/details', routes.api.tickets.details);
  app.get('/api/tickets/assign', routes.api.tickets.assign);
  app.get('/api/tickets/fill', routes.api.tickets.fill);
  app.post('/api/tickets/save', routes.api.tickets.save);

  app.use(function (req, res) {
    res.status(404);
    res.render('errors/404');
  });

  app.use('/api*', function (err, req, res, next) {
    if (err) console.log(err);
    logger.log(err, function () {
      if (!err.internal) {
        res.apiResponse({error: {message: err.message, internal: false, code: err.code}});
      } else {
        res.apiResponse({error: {message: 'Internal server error.', code: 'INTERNAL', internal: true}});
      }
    });
  });

  app.use(function (err, req, res, next) {
    if (err) console.log(err);
    logger.log(err, function () {
      res.status(500);
      res.render('errors/500');
    });
  });
};
