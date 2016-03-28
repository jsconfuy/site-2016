var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Tickets Model
 * =============
 */

var Ticket = new keystone.List('Ticket', {
  sortable: true,
  map: { name: 'name' },
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true}
});

Ticket.add({
  name: { type: String, required: true, initial: true },
  code: { type: String, required: true, unique: true, initial: true },
  logo: { type: Types.CloudinaryImage },
  description: { type: Types.Markdown },
  sale: {
    from: { type: Types.Datetime },
    until: { type: Types.Datetime }
  },
  price: { type: Types.Money },
  limit: { type: Types.Number, default: 0, note: '0 for no limit.' },
  min: { type: Types.Number, default: 1, note: 'Minimun per purchase' },
  max: { type: Types.Number, default: 5, note: 'Maximun per purchase' },
  secret: { type: Types.Boolean, default: true, indent: true }
});

Ticket.schema.virtual('total').get(function () {
  return this.limit || '∞';
}).depends = 'limit';

Ticket.calculateDiscount = function (ticket, discount) {
  var value = discount ? discount.flat + (discount.percentage / 100 * ticket.price) : 0;
  if (value > ticket.price) {
    return ticket.price;
  }
  return value;
};

Ticket.schema.pre('validate', function(next) {
  // Because we need custom code (no auto slug) and Keystone doesn't support mongoose validation
  this.code = this.code && this.code.toLowerCase();
  if (! /^[a-z0-9-]+$/.test(this.code)) {
      return next(Error('Invalid code format. Use numbers, letters or -.'));
  }
  next();
});

Ticket.defaultColumns = 'name, code, sale.from, sale.until, price, sold, total, secret';
Ticket.register();
