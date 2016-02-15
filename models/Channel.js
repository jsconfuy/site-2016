var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Channels Model
 * ==========
 */

var Channel = new keystone.List('Channel', {
  map: { name: 'name'},
  autokey: { path: 'slug', from: 'name', unique: true },
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true }
});

Channel.add({
  name: { type: String, required: true },
});

Channel.relationship({ ref: 'Sponsor', refPath: 'channels', path: 'sponsors' });
Channel.relationship({ ref: 'Speaker', refPath: 'channels', path: 'speakers' });
Channel.relationship({ ref: 'Proposal', refPath: 'channels', path: 'proposals' });
Channel.relationship({ ref: 'Talk', refPath: 'channels', path: 'talks' });
Channel.relationship({ ref: 'Workshop', refPath: 'channels', path: 'workshops' });

Channel.defaultColumns = 'name, slug';
Channel.register();
