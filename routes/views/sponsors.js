var keystone = require('keystone');

exports = module.exports = function (req, res) {
  var view = new keystone.View(req, res);
  var locals = res.locals;

  locals.sponsorLevels = [];

  view.on('init', function (next) {
    var Sponsor = keystone.list('Sponsor');
    var q = Sponsor.model.find({}).where('published').lte(Date.now()).where('status', 'P').sort('sortOrder').populate('level');

    q.exec(function (err, results) {
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

      next();
    });
  });

  view.render('sponsors');
};
