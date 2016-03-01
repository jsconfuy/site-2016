var keystone = require('keystone');

exports = module.exports = function (req, res) {
  var view = new keystone.View(req, res);
  var locals = res.locals;

  /**
   * Speakers
   */
  locals.speakers = [];
  view.on('init', function (next) {
    keystone.list('Speaker').model.find()
      .where('published').lte(Date.now()).where('status', 'P')
      .sort('sortOrder')
      .exec(function (err, speakers) {
        locals.speakers = speakers;
        keystone.list('Talk').model.find().exec(function (err, talks) {
          speakers.forEach(function (speaker) {
            speaker.talks = speakers.talks || [];
            talks.forEach(function (talk) {
              if (talk.speakers.indexOf(speaker._id) > -1) {
                speaker.talks.push(talk);
              }
            });
          });
          keystone.list('Workshop').model.find().exec(function (err, workshops) {
            speakers.forEach(function (speaker) {
              speaker.workshops = speakers.workshops || [];
              workshops.forEach(function (workshop) {
                if (workshop.speakers.indexOf(speaker._id) > -1) {
                  speaker.workshops.push(workshop);
                }
              });
            });
            next(err);
          });
        });
      });
  });

  /**
   * Sponsors
   */
  locals.sponsorLevels = [];
  view.on('init', function (next) {
    var Sponsor = keystone.list('Sponsor');
    var q = Sponsor.model.find({}).where('published').lte(Date.now()).where('status', 'P').sort('sortOrder').populate('level');

    q.exec(function (err, results) {
      // TODO: handle err!
      if (err) console.error(err);

      results.forEach(function (sponsor) {
        if (!sponsor.level) return undefined;

        // Insert level ordered
        var found = false;
        var sponsorLevel = null;
        for (var index = 0; index < locals.sponsorLevels.length; index++) {
          sponsorLevel = locals.sponsorLevels[index];
          if (sponsorLevel._id === sponsor.level._id) {
            found = true;
            break;
          } else if (sponsorLevel.sortOrder > sponsor.level.sortOrder) {
            break;
          }
        }
        if (!found) {
          locals.sponsorLevels.splice(index, 0, sponsor.level);
        }

        // Add sponsor to level
        sponsorLevel = locals.sponsorLevels[index];
        sponsorLevel.sponsors = sponsorLevel.sponsors || [];
        sponsorLevel.sponsors.push(sponsor);
      });

      next(err);
    });
  });

  /**
   * Members
   */
  locals.organizers = [];
  view.on('init', function (next) {
    var list = keystone.list('Member');
    var q = list.model.find({role: 'O'}).where('published').lte(Date.now()).sort('sortOrder');
    q.exec(function (err, results) {
      // TODO: handle err!
      if (err) console.error(err);
      locals.organizers = results;
      next(err);
    });
  });

  locals.volunteers = [];
  view.on('init', function (next) {
    var list = keystone.list('Member');
    var q = list.model.find({role: 'V'}).where('published').lte(Date.now()).sort('sortOrder');
    q.exec(function (err, results) {
      // TODO: handle err!
      if (err) console.error(err);
      locals.volunteers = results;
      next(err);
    });
  });

  view.render('home');
};
