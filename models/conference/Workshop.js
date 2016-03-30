var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Workshops Model
 * ===============
 */

var Workshop = new keystone.List('Workshop', {
  map: { name: 'title' },
  perPage: 200,
  autokey: { path: 'slug', from: 'title', unique: true },
  sortable: true,
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true}
});

Workshop.add(
  'Organization',
  {
    proposal: { type: Types.Relationship, ref: 'Proposal', many: false },
    invitation: { type: Types.Relationship, ref: 'Invitation', many: false },
    assignee: { type: Types.Relationship, ref: 'Member', index: true },
    status: { type: Types.Select, default: 'D', options: [
      { value: 'D', label: 'Draft' },
      { value: 'T', label: 'To Publish' },
      { value: 'P', label: 'Published' }
    ]},
    tags: {type: Types.Relationship, ref: 'Tag', many: true},
    notes: {type: Types.Markdown}
  },
  'Details',
  {
    title: { type: String, required: true },
    speakers: { type: Types.Relationship, ref: 'Speaker', many: true },
    description: { type: Types.Markdown },
    language: { type: Types.Select, default: 'E', options: [
      { value: 'E', label: 'English' },
      { value: 'S', label: 'Spanish' }]},
    hours: { type: Types.Number },
    instructions: { type: Types.Markdown },
  }
);

Workshop.relationship({ ref: 'Speaker', path: 'speakers' });
Workshop.relationship({ ref: 'Tag', path: 'tags' });
Workshop.relationship({ ref: 'Slot', refPath: 'workshop', path: 'slots' });
Workshop.relationship({ ref: 'Attendee', refPath: 'workshops', path: 'attendees' });

Workshop.defaultColumns = 'title, speakers, tags, status, hours, assignee, language';
Workshop.register();
