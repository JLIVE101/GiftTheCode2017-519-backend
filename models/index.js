var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
// var env = process.env.NODE_ENV || "development";
var config = require(path.join(__dirname, '..', 'config', 'config.json'));
var sequelize = new Sequelize(config.database, config.username, config.password, config.sequelize);
var db = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Login.belongsTo(db.Member, { foreignKey: 'memberId' });
db.Member.hasOne(db.Login, { foreignKey: 'memberId' });

db.Household.belongsTo(db.Member, { foreignKey: 'relationshipId' });
db.Member.hasMany(db.Household, { foreignKey: 'relationshipId' });

db.Permission.belongsTo(db.Member, { foreignKey: 'permId' });
db.Member.hasOne(db.Permission, { foreignKey: 'permId' });

db.Status.belongsTo(db.Member,  { foreignKey: 'memberId' });
db.Member.hasOne(db.Status, { foreignKey: 'memberId' });

db.Event.hasMany(db.EventCategory, { foreignKey: 'eventId' });
db.Category.hasMany(db.EventCategory, { foreignKey: 'categoryId' });
db.EventCategory.belongsTo(db.Event, { foreignKey: 'eventId' });
db.EventCategory.belongsTo(db.Category, { foreignKey: 'categoryId' });

db.Category.hasMany(db.MemberPreference, { foreignKey: 'categoryId' });
db.Member.hasMany(db.MemberPreference, { foreignKey: 'memberId' });
db.MemberPreference.belongsTo(db.Member, { foreignKey: 'memberId' });
db.MemberPreference.belongsTo(db.Category, { foreignKey: 'categoryId' });

db.Testimony.belongsTo(db.Member, { foreignKey: 'memberId' });
db.Member.hasOne(db.Testimony, { foreignKey: 'memberId' });

module.exports = db;