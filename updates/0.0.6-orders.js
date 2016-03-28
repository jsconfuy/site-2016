var keystone = require('keystone')
var Order = keystone.list('Order')

exports = module.exports = function (done) {
  Order.model.find({}).exec(function (err, orders) {
    if (err) return;
    var save = function () {
      var order = orders.pop();
      if (!order) return done();
      order.save(function (err) {
        if (err) return save();
        save();
      });
    }
    save();
  });
};
