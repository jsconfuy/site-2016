var async = require('async');
var keystone = require('keystone');
var mongoose = require('mongoose');
var Types = keystone.Field.Types;

/**
 * Orders Model
 * ============
 */

var Order = new keystone.List('Order', {
  map: {name: 'reference'},
  perPage: 400,
  track: {createdBy: true, createdAt: true, updatedBy: true, updatedAt: true},
  nocreate: true
});

Order.add({
  task: {type: Types.Select, options: [
    {value: 'send-email', label: 'Send Thank You Email'}
  ]},
  reference: {type: String, unique: true, noedit: true},
  name: {type: String},
  email: {type: Types.Email},
  ticket: {type: Types.Relationship, ref: 'Ticket', index: true},
  discount: {type: Types.Relationship, ref: 'Discount', index: true},
  price: {
    ticket: {type: Types.Money},
    discount: {type: Types.Money, default: 0}
  },
  quantity: {type: Types.Number, default: 1},
  total: {type: Types.Money},
  reserved: {type: Types.Datetime},
  paid: {type: Types.Datetime},
  canceled: {type: Types.Datetime},
  payment: {
    gateway: {
      label: 'Gateway', type: Types.Select, options: [
        {value: '2checkout', label: '2Checkout'},
        {value: 'paypal', label: 'PayPal'}
      ]},
    order: {type: String},
    invoice: {type: String}
  },
  tags: {type: Types.Relationship, ref: 'Tag', many: true}
});

Order.schema.add({'payment.data': mongoose.Schema.Types.Mixed});

Order.relationship({ref: 'Attendee', refPath: 'order', path: 'attendees'});
Order.relationship({ ref: 'Tag', path: 'tags' });

Order.schema.pre('save', function (next) {
  var order =  this;
  async.series([
    // Custom tasks
    function (callback) {
      order.execute(callback);
    },
    // Generate reference code
    function (callback) {
      var reference = function () {
        order.reference = Math.random().toString(36).slice(2, 6).toUpperCase();
        Order.model.find().where('reference', order.reference).exec(function (err, results) {
          if (!results.length) return callback();
          return reference();
        });
      };
      return reference();
    },
  ], next);
});

Order.schema.methods.execute = function (callback) {
  if (this.task === 'send-email') {
    this.task = null;
    this.sendOrderConfirmation(function (err) {
      callback();
    });
    return;
  }
  callback();
};

Order.schema.methods.sendOrderConfirmation = function (callback) {
  if (typeof callback !== 'function') {
    callback = function () {};
  }
  var order = this;
  if (!order.email) return callback();

  new keystone.Email('order-confirmation').send({
    to: order.email,
    from: {
      name: 'JSConfUY',
      email: 'hola@jsconf.uy'
    },
    subject: 'Thank you! - ' + order.quantity + ' × tickets registered by ' + order.name,
    order: order,
  }, function () {
    callback();
  });
};

Order.defaultColumns = 'reference, name, email, reserved, paid, ticket, discount, quantity';
Order.register();
