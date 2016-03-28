var keystone = require('keystone');
var tickets = require('../../lib/tickets');
var ApiError = require('../../lib/apierror');
var Ticket = keystone.list('Ticket');

module.exports.available = function (req, res, next) {
  tickets.available(req.query.ticket, req.query.discount, function (err, tickets, discount, messages) {
    if (err) return next(err);
    tickets = tickets.filter(function (ticket) {
      return ticket.available > 0 && (!discount || discount.available > 0);
    }).map(function (ticket) {
      return {
        code: ticket.code,
        name: ticket.name,
        logo: ticket.logo,
        available: Math.min(ticket.available, discount ? discount.available : ticket.available),
        min: Math.max(ticket.min, discount ? discount.min : ticket.min),
        max: Math.min(ticket.max, discount ? discount.max : ticket.max),
        retail: Math.round(ticket.price * 100) / 100,
        price: (Math.round(ticket.price * 100) / 100) - (Math.round(Ticket.calculateDiscount(ticket, discount) * 100) / 100)
      };
    });
    if (discount) {
      discount = {
        code: discount.code,
        name: discount.name,
        logo: discount.logo
      };
    }
    res.apiResponse({tickets: tickets, discount: discount, messages: messages});
  });
};

module.exports.select = function (req, res, next) {
  tickets.select(req.body.ticket, req.body.discount, req.body.quantity, function (err, order, messages) {
    if (err) return next(err);
    order = {
      id: order._id,
      reference: order.reference,
      ticket: order.ticket.name,
      quantity: order.quantity,
      paid: !!order.paid,
      price: order.price.ticket - order.price.discount,
      total: order.total
    };
    res.apiResponse({order: order, messages: messages});
  });
};

module.exports.assign = function (req, res, next) {
  tickets.assign(req.query.order, function (err, order, attendees, messages) {
    if (err) return next(err);
    order = {
      id: order._id,
      reference: order.reference,
      paid: !!order.paid
    };
    attendees = attendees.map(function (attendee) {
      return {
        id: attendee._id,
        reference: attendee.reference,
        name: attendee.name,
        email: attendee.email,
        tshirt: attendee.tshirt,
        extra: attendee.extra
      };
    });
    res.apiResponse({order: order, attendees: attendees, messages: messages});
  });
};

module.exports.details = function (req, res, next) {
  tickets.details(req.body.order, req.body.name, req.body.email, function (err, messages) {
    if (err) return next(ApiError(err.message, 'DB', true));
    res.apiResponse({messages: messages});
  });
};

module.exports.fill = function (req, res, next) {
  tickets.fill(req.query.attendee, function (err, attendee, messages) {
    if (err) return next(err);
    attendee = {
      id: attendee._id,
      reference: attendee.reference,
      name: attendee.name,
      email: attendee.email,
      tshirt: attendee.tshirt
    };
    res.apiResponse({attendee: attendee, messages: messages});
  });
};

module.exports.save = function (req, res, next) {
  var fill = function (attendee) {
    attendee.name = req.body['name'];
    attendee.email = req.body['email'];
    attendee.tshirt = req.body['tshirt'];
    attendee.extra = req.body['extra'];
  };
  tickets.save(req.body.id, fill, function (err, messages) {
    if (err) return next(ApiError(err.message, 'DB', true));
    res.apiResponse({messages: messages});
  });
};
