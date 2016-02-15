var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Sponsors Model
 * ==============
 */

var Sponsor = new keystone.List('Sponsor', {
  map: { name: 'name' },
  perPage: 200,
  sortable: true,
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true}
});

Sponsor.add(
  'Organization',
  {
    assignee: { type: Types.Relationship, ref: 'Member', index: true },
    status: { type: Types.Select, default: 'O', options: [
      { value: 'O', label: 'To Contact' },
      { value: 'W', label: 'Waiting Response' },
      { value: 'E', label: 'No Response' },
      { value: 'C', label: 'Sponsor Accepts' },
      { value: 'R', label: 'Sponsor Rejects' },
      { value: 'T', label: 'To Publish' },
      { value: 'P', label: 'Published' }
    ]},
    level: { type: Types.Relationship, ref: 'SponsorLevel', index: true },
    published: { type: Types.Datetime },
    price: { type: Types.Money, required: true, default: 0 },
    paid: { type: Types.Datetime },
    channels: { type: Types.Relationship, ref: 'Channel', many: true },
    tags: {type: Types.Relationship, ref: 'Tag', many: true},
    notes: {type: Types.Markdown}
  },
  'Details',
  {
    name: { type: String, required: true },
    description: { type: Types.Markdown },
    logo: { type: Types.CloudinaryImage },
    url: { type: Types.Url },
    contact: {
      name: { type: String },
      email: { type: Types.Email }
    },
  }
);

Sponsor.defaultColumns = 'name, level, tags, status, published, paid, price, assignee';
Sponsor.register();
