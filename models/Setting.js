var keystone = require('keystone');

/**
 * Settings Model
 * ==========
 */

var Setting = new keystone.List('Setting', {
  map: { name: 'key'},
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true }
});

Setting.add({
  key: { type: String, required: true, initial: true },
  value: { type: String, required: true, initial: true },
  description: { type: String }
});

Setting.get = function (key, def, errback, callback) {
  Setting.model.findOne({key: key}).exec(function (err, setting) {
    if (err) {
      errback(err);
    } else if (setting) {
      callback(setting.value);
    } else {
      callback(def);
    }
  });
};

Setting.defaultColumns = 'name, description, value';
Setting.register();
