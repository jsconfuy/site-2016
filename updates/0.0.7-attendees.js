var keystone = require('keystone')
var Order = keystone.list('Order')
var Attendee = keystone.list('Attendee')

exports = module.exports = function (done) {
  Order.model.find({}).exec(function (err, orders) {
    if (err) return;
    var save = function () {
      var order = orders.pop();
      if (!order) return done();
      var position = 0;
      Attendee.model.find({order: order._id}).exec(function (err, attendees) {
        var position = 1;
        var update = function () {
          var attendee = attendees.pop();
          if (!attendee) return save();
          attendee.reference = order.reference + '-' + position;
          position++;
          attendee.save(function (err) {
            update();
          });
        };
        update();
      });
    }
    save();
  });
};
