var keystone = require('keystone');
var Attendee = keystone.list('Attendee');
var Order = keystone.list('Order');

exports = module.exports = function (req, res) {
  var view = new keystone.View(req, res);
  var locals = res.locals;

  var reference = req.params.ref.toUpperCase();
  if (/-/.test(reference)) {
    Attendee.model.findOne({reference: reference}).populate('order').exec(function (err, attendee) {
      if (err) { return res.notFound(); }
      if (attendee.order) {
        Order.model.findOne({_id: attendee.order._id}).populate('ticket discount').exec(function (err, order) {
          if (err) { return res.notFound(); }
          locals.order = order;
          locals.attendees = [attendee];
          view.render('print');
        });
      } else {
        locals.order = null;
        locals.attendees = [attendee];
        view.render('print');
      }
    });
  } else {
    Order.model.findOne({reference: reference}).populate('ticket discount').exec(function (err, order) {
      if (err) { return res.notFound(); }
      Attendee.model.find({order: order._id}).sort('reference').exec(function (err, attendees) {
        if (err) { return res.notFound(); }
        locals.order = order;
        locals.attendees = attendees;
        view.render('print');
      });
    });
  }
};
