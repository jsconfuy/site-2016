var keystone = require('keystone');
var Attendee = keystone.list('Attendee');

exports = module.exports = function (req, res) {
  var view = new keystone.View(req, res);
  var locals = res.locals;

  var reference = (req.query.ref || '').toUpperCase();
  Attendee.model.findOne({reference: reference}).populate('order').exec(function (err, attendee) {
    locals.reference = reference;
    if (err || !attendee) {
      locals.attendee = null;
      locals.status = 404;
      view.render('registration');
    } else if (attendee.registered) {
      locals.attendee = null;
      locals.status = 409;
      view.render('registration');
    } else {
      attendee.registered = Date.now();
      attendee.save(function (err) {
        locals.attendee = attendee;
        locals.status = 200;
        view.render('registration');
      });
    }
  });
};
