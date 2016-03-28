// Load .env for development environments
require('dotenv').load();
var keystone = require('keystone');
var Attendee = keystone.list('Attendee');
var Order = keystone.list('Order');

exports.initLocals = function (req, res, next) {
  var locals = res.locals;

  locals.user = req.user;
  locals.ticketReservation = process.env.TICKET_RESERVATION;
  locals.baseUrl = process.env.BASE_URL;
  locals.gateway = process.env.GATEWAY;
  locals.twocoEnv = process.env.TWOCO_ENV;
  locals.twocoSellerId = process.env.TWOCO_SELLER_ID;
  locals.paypalEnv = process.env.PAYPAL_ENV;
  locals.paypalBusiness = process.env.PAYPAL_BUSINESS;

  var order = req.query.order;
  var attendee = req.query.attendee;
  var reference = req.query.ref;

  var query = function () {
    locals.query = {
      ticket: req.query.ticket,
      discount: req.query.discount,
      order: order,
      attendee: attendee,
      reference: reference
    };
    next();
  };

  if (reference) {
    reference = reference.toUpperCase();
    if (/-/.test(reference)) {
      Attendee.model.findOne({reference: reference}).exec(function (err, result) {
        if (result) {
          attendee = result._id
        }
        query();
      });
    } else {
      Order.model.findOne({reference: reference}).exec(function (err, result) {
        if (result) {
          order = result._id
        }
        query();
      });
    }
  } else {
    query();
  }
};

exports.requireUser = function (req, res, next) {
  if (!req.user) {
    res.redirect('/keystone/signin');
  } else {
    next();
  }
};
