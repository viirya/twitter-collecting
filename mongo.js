// Generated by CozyScript 0.1.1
(function() {
  var Database, Db, MongoDatabase, Server, assert, mongo,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  mongo = require('mongodb');

  assert = require('assert');

  Server = mongo.Server;

  Db = mongo.Db;

  Database = (function() {

    function Database(config) {
      this.config = config;
    }

    Database.prototype.init = function() {};

    Database.prototype.operate = function(cb) {};

    return Database;

  })();

  MongoDatabase = (function(_super) {

    __extends(MongoDatabase, _super);

    function MongoDatabase() {
      return MongoDatabase.__super__.constructor.apply(this, arguments);
    }

    MongoDatabase.prototype.init = function() {
      this.server = new Server(this.config.host, this.config.port, this.config.options);
      return this.db = new Db(this.config.db, this.server, {
        journal: true
      });
    };

    MongoDatabase.prototype.operate = function(cb, col) {
      var _this = this;
      if (col == null) {
        col = this.config.collection;
      }
      return this.db.open(function(err, db) {
        if (!err) {
          return db.authenticate(_this.config.username, _this.config.password, function(err, result) {
            assert.equal(true, result);
            return db.collection(col, function(err, collection) {
              return cb(collection);
            });
          });
        } else {
          return console.log(err);
        }
      });
    };

    MongoDatabase.prototype.close = function() {
      return this.db.close();
    };

    MongoDatabase.prototype.select_collection = function(db_collection, cb) {
      return db.collection(db_collection, function(err, collection) {
        return cb(collection);
      });
    };

    return MongoDatabase;

  })(Database);

  exports.MongoDatabase = MongoDatabase;

}).call(this);
