var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Members Model
 * =============
 */

var Member = new keystone.List('Member', {
  map: { name: 'name' },
  autokey: { path: 'slug', from: 'name', unique: true },
  sortable: true,
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true }
});

Member.add(
  'Organization',
  {
    role: {
      type: Types.Select, options: [
        {value: 'O', label: 'Oganizer'},
        {value: 'V', label: 'Volunteer'}
      ]},
    published: { type: Types.Datetime },
  },
  'Details',
  {
  name: { type: String, required: true },
  email: { type: Types.Email },
  twitter: { type: String, required: true, initial: true },
  picture: { type: Types.CloudinaryImage },
  biography: { type: Types.Markdown },
});

Member.relationship({ ref: 'Proposal', refPath: 'assignee', path: 'proposals' });
Member.relationship({ ref: 'Invitation', refPath: 'assignee', path: 'invitations' });
Member.relationship({ ref: 'Speaker', refPath: 'assignee', path: 'speakers' });
Member.relationship({ ref: 'Talk', refPath: 'assignee', path: 'talks' });
Member.relationship({ ref: 'Workshop', refPath: 'assignee', path: 'workshops' });
Member.relationship({ ref: 'Sponsor', refPath: 'assignee', path: 'sponsors' });

Member.defaultColumns = 'name, role, twitter, email, published';
Member.register();
