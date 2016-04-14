var keystone = require('keystone');
var Proposal = keystone.list('Proposal');
var Attendee = keystone.list('Attendee');

exports = module.exports = function (req, res) {
  var view = new keystone.View(req, res);
  var locals = res.locals;
  var reference = (req.query.for || '').toUpperCase();

  locals.attendee = null;
  locals.cfp = {};
  locals.cfp.data = req.body || {};
  locals.cfp.errors = {};
  locals.cfp.submitted = false;

  view.on('init', function (next) {
    Attendee.model.findOne({reference: reference}).exec(function (err, attendee) {
      locals.attendee = attendee;
      next();
    });
  });

  view.on('post', {action: 'submit'}, function (next) {
    var proposal = new Proposal.model();
    var updater = proposal.getUpdateHandler(req);

    proposal.type = 'L';
    if (locals.attendee) {
      proposal.name = locals.attendee.name;
      proposal.email = locals.attendee.email;
    }

    updater.process(req.body, {
      required: 'topic, twitter',
      fields: 'name, email, topic, twitter, extra',
      errorMessage: 'There was a problem submitting your proposal:'
    }, function (err) {
      if (err) {
        locals.cfp.errors = err.errors;
      } else {
        locals.cfp.submitted = true;
      }
      next();
    });
  });

  view.render('cfl');
};
