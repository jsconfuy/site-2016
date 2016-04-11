var keystone = require('keystone');
var Attendee = keystone.list('Attendee');

exports = module.exports = function (req, res) {
  res.redirect('http://owu.herokuapp.com');
};
