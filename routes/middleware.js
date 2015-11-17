// Load .env for development environments
require('dotenv').load();
var keystone = require('keystone');

exports.initLocals = function (req, res, next) {
  var locals = res.locals;

  locals.user = req.user;
  locals.buy = {
    ticket: req.query.ticket,
    discount: req.query.discount,
    order: req.query.order
  };
  locals.ticketReservation = process.env.TICKET_RESERVATION;
  locals.baseUrl = process.env.BASE_URL;

  locals.gateway = process.env.GATEWAY;
  locals.twocoEnv = process.env.TWOCO_ENV;
  locals.twocoSellerId = process.env.TWOCO_SELLER_ID;
  locals.paypalEnv = process.env.PAYPAL_ENV;
  locals.paypalBusiness = process.env.PAYPAL_BUSINESS;
  locals.gold = req.query.g === '' ? 'gold' : '';

  var list = keystone.list('Speaker');
  var q = list.model.find().where('published').lte(Date.now()).where('status', list.STATUS_CONFIRMED).sort('sortOrder');
  q.exec(function (err, results) {
    locals.hasSpeakers = results.length;
    console.log('hola');
    next(err)
  });
};

exports.requireUser = function (req, res, next) {
  if (!req.user) {
    res.redirect('/keystone/signin')
  } else {
    next()
  }
}
