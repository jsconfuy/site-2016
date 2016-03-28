var keystone = require('keystone');
var Types = keystone.Field.Types;
var crypto = require('crypto');
var countries = require('country-list')();

/**
 * Attendees Model
 * ===============
 */

var Attendee = new keystone.List('Attendee', {
  map: {name: 'reference'},
  perPage: 400,
  track: {createdBy: true, createdAt: true, updatedBy: true, updatedAt: true}
});

Attendee.add(
  'Organization',
  {
    reference: {type: String, unique: true, noedit: true},
    order: {type: Types.Relationship, ref: 'Order', index: true, noedit: true},
    ticket: {type: Types.Relationship, ref: 'Ticket', index: true},
    discount: {type: Types.Relationship, ref: 'Discount', index: true},
    price: {type: Types.Money, required: false},
    tags: { type: Types.Relationship, ref: 'Tag', many: true },
    notes: { type: Types.Markdown }
  },
  'Details',
  {
    name: {type: String},
    email: {type: Types.Email},
    tshirt: {
      label: 'T-Shirt', type: Types.Select, options: [
        {value: 'XS', label: 'XS'},
        {value: 'S', label: 'S'},
        {value: 'M', label: 'M'},
        {value: 'L', label: 'L'},
        {value: 'XL', label: 'XL'},
        {value: 'XXL', label: 'XXL'}
      ]},
    gender: {
      label: 'Gender', type: Types.Select, options: [
        {value: 'F', label: 'Female'},
        {value: 'M', label: 'Male'}
      ]},
    country: {
      label: 'Country', type: Types.Select, options: countries.getData().map(function (country) {
        return {label: country.name, value: country.code};
      })},
    extra: {type: Types.Textarea}
  }
);

Attendee.schema.pre('save', function (next) {
  if (!this.reference && !this.order) {
    var that = this;
    var reference = function () {
      that.reference = Math.random().toString(36).slice(2, 6).toUpperCase() + '-1';
      Attendee.model.find().where('reference', that.reference).exec(function (err, results) {
        if (!results.length) return next();
        return reference();
      });
    };
    return reference();
  }
  next();
});

Attendee.schema.virtual('picture').get(function () {
  var email = (this.email || '').trim().toLowerCase();
  var hash = crypto.createHash('md5').update(email).digest('hex').toLowerCase();
  return 'http://www.gravatar.com/avatar/' + hash + '?s=200&d=retro';
}).depends = 'email';

Attendee.schema.virtual('image', {type: 'html'}).get(function () {
  return '<img style="width: 32px; height: 32px; border-radius: 32px;" src="' + this.picture + '"/>';
});

Attendee.defaultColumns = 'reference, name, email, gender, tshirt, country, ticket, discount, order';
Attendee.register();
