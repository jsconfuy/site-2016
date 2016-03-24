var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Talks Model
 * ===========
 */

var Talk = new keystone.List('Talk', {
  autokey: { path: 'slug', from: 'title', unique: true },
  perPage: 200,
  map: { name: 'title' },
  sortable: true,
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true}
});

Talk.add(
  'Organization',
  {
    assignee: { type: Types.Relationship, ref: 'Member', index: true },
    status: { type: Types.Select, default: 'D', options: [
      { value: 'D', label: 'Draft' },
      { value: 'T', label: 'To Publish' },
      { value: 'P', label: 'Published' }
    ]},
    proposal: { type: Types.Relationship, ref: 'Proposal', many: false },
    invitation: { type: Types.Relationship, ref: 'Invitation', many: false },
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
  }
);

Talk.relationship({ ref: 'Speaker', path: 'speakers' });
Talk.relationship({ ref: 'Tag', path: 'tags' });
Talk.relationship({ ref: 'Slot', refPath: 'talk', path: 'slots' });

Talk.defaultColumns = 'title, speakers, tags, status, assignee, language';
Talk.register();
