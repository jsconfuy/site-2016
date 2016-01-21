var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Proposals Model
 * ===============
 */

var Proposal = new keystone.List('Proposal', {
  map: { name: 'topic' },
  perPage: 200,
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true },
  sortable: true
});

Proposal.add(
  {
    assignee: { type: Types.Relationship, ref: 'Organizer', index: true },
    topic: { type: String, required: true, intial: true },
    status: { type: Types.Select, default: 'P', options: [
      { value: 'P', label: 'Pending' },
      { value: 'A', label: 'Accepted' },
      { value: 'O', label: 'Confirmed' },
      { value: 'C', label: 'Canceled' },
      { value: 'D', label: 'Declined' }
    ]},
    source: { type: Types.Select, required: true, default: 'C', options: [
      { value: 'C', label: 'Call' },
      { value: 'I', label: 'Internal' }
    ]},
    type: { type: Types.Select, required: true, default: 'T', options: [
      { value: 'T', label: 'Talk' },
      { value: 'W', label: 'Workshop' }
    ]},
    summary: { type: Types.Textarea},
    diversity: { type: Types.Boolean, default: false, indent: true },
    coasted: { type: Types.Boolean, intial: true, default: false, indent: true },
    estimated: { type: Types.Money, required: false, default: 0 },
    name: { type: String },
    email: { type: Types.Email },
    residence: { type: String },
    biography: { type: Types.Textarea },
    extra: { type: Types.Markdown },
    tags: { type: Types.Relationship, ref: 'Tag', many: true },
    demoTalk: { type: String },
    notes: { type: Types.Markdown }
  },
  'Votes',
  {
    score: { type: Types.Number, noedit: true, default: 0 },
    votes: {
      // TODO: Custom field type Vote / Organizer
      pricco: { label: 'Pablo Ricco', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      ssassi: { label: 'Sebastian Sassi', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      pdejuan: { label: 'Pablo Dejuan', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      mprunell: { label: 'Martin Prunell', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      guest1: { label: 'Guest 1', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      guest2: { label: 'Guest 2', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      guest3: { label: 'Guest 3', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      guest4: { label: 'Guest 4', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] }
    }
  }
);

Proposal.schema.pre('save', function (next) {
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
  inc(this.votes.guest1);
  inc(this.votes.guest2);
  inc(this.votes.guest3);
  inc(this.votes.guest4);
  this.score = (votes ? score / votes : 0).toFixed(1);
  next();
});

Proposal.relationship({ ref: 'Tag', path: 'tags' });
Proposal.defaultColumns = 'topic|30%, name, coasted, tags, status, score, assignee';
Proposal.register();
