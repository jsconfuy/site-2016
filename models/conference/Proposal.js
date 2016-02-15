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
  'Organization',
  {
    assignee: { type: Types.Relationship, ref: 'Member', index: true },
    status: { type: Types.Select, default: 'N', options: [
      { value: 'N', label: 'New' },
      { value: 'V', label: 'Voting' },
      { value: 'S', label: 'Selected' },
      { value: 'C', label: 'Not Selected' },
      { value: 'W', label: 'Waiting Confirmation' },
      { value: 'A', label: 'Speaker Accepts' },
      { value: 'J', label: 'Speaker Rejects' },
      { value: 'R', label: 'Rejected' },
      { value: 'L', label: 'Speaker Duplicated' },
      { value: 'O', label: 'No Response' }
    ]},
    tags: { type: Types.Relationship, ref: 'Tag', many: true },
    notes: { type: Types.Markdown }
  },
  'Details',
  {
    topic: { type: String, required: true, initial: true },
    source: { type: Types.Select, required: true, default: 'C', options: [
      { value: 'C', label: 'Call' },
      { value: 'I', label: 'Internal' }
    ]},
    type: { type: Types.Select, required: true, default: 'T', options: [
      { value: 'T', label: 'Talk' },
      { value: 'W', label: 'Workshop' }
    ]},
    summary: { type: Types.Textarea},
    demo: { type: String },
    diversity: { type: Types.Boolean, default: false, indent: true },
    coasted: { type: Types.Boolean, intial: true, default: false, indent: true },
    estimated: { type: Types.Money, required: false, default: 0 },
    name: { type: String },
    email: { type: Types.Email },
    residence: { type: String },
    biography: { type: Types.Textarea },
    extra: { type: Types.Markdown },
    demoTalk: { type: String },
  },
  'Votes',
  {
    score: { type: Types.Number, noedit: true, default: 0 },
    votes: {
      // TODO: Custom field type Vote / Member
      pricco: { label: 'Pablo Ricco', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      ssassi: { label: 'Sebastian Sassi', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      pdejuan: { label: 'Pablo Dejuan', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      mprunell: { label: 'Martin Prunell', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
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
  this.score = (votes ? score / votes : 0).toFixed(1);
  next();
});

Proposal.relationship({ ref: 'Tag', path: 'tags' });
Proposal.relationship({ ref: 'Speaker', refPath: 'proposal', path: 'speakers' });
Proposal.relationship({ ref: 'Talk', refPath: 'proposal', path: 'talks' });
Proposal.relationship({ ref: 'Workshop', refPath: 'proposal', path: 'workshops' });

Proposal.defaultColumns = 'topic|30%, name, coasted, tags, status, score, assignee';
Proposal.register();
