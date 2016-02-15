var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Invitations Model
 * =================
 */

var Invitation = new keystone.List('Invitation', {
  map: { name: 'name' },
  perPage: 200,
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true },
  sortable: true
});

Invitation.add(
  'Organization',
  {
    assignee: { type: Types.Relationship, ref: 'Member', index: true },
    status: { type: Types.Select, default: 'N', options: [
      { value: 'N', label: 'New' },
      { value: 'V', label: 'Voting' },
      { value: 'T', label: 'To Invite' },
      { value: 'I', label: 'Invitation Sent' },
      { value: 'O', label: 'No Accepted' },
      { value: 'A', label: 'Guest Accepts' },
      { value: 'D', label: 'Guest Rejects' },
      { value: 'E', label: 'No Response' }
    ]},
    channels: { type: Types.Relationship, ref: 'Channel', many: true },
    tags: { type: Types.Relationship, ref: 'Tag', many: true },
    notes: { type: Types.Markdown }
  },
  'Details',
  {
    name: { type: String, required: true, initial: true },
    knownFor: { type: String, required: true, initial: true },
    email: { type: Types.Email },
    twitter: { type: Types.Url},
    github: { type: Types.Url},
    diversity: { type: Types.Boolean, default: false, indent: true },
    estimated: { type: Types.Money, required: false, default: 0 }
  },
  'Votes',
  {
    score: { type: Types.Number, noedit: true, default: 0 },
    votes: {
      // TODO: Custom field type Vote / Member
      pricco: { label: 'Pablo Ricco', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      ssassi: { label: 'Sebastian Sassi', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      pdejuan: { label: 'Pablo Dejuan', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      mprunell: { label: 'Martin Prunell', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] }
    }
  }
);

Invitation.schema.pre('save', function (next) {
  var votes = 0;
  var score = 0;
  var inc = function (vote) {
    score += vote || 0;
    votes += vote ? 1 : 0;
  };
  inc(this.votes.pricco);
  inc(this.votes.pdejuan);
  inc(this.votes.ssassi);
  inc(this.votes.mprunell);
  this.score = (votes ? score / votes : 0).toFixed(1);
  next();
});

Invitation.relationship({ ref: 'Tag', path: 'tags' });
Invitation.relationship({ ref: 'Speaker', refPath: 'invitation', path: 'speakers' });
Invitation.relationship({ ref: 'Talk', refPath: 'invitation', path: 'talks' });
Invitation.relationship({ ref: 'Workshop', refPath: 'invitation', path: 'workshops' });

Invitation.defaultColumns = 'name, knownFor, tags, status, score, estimated, assignee';
Invitation.register();
