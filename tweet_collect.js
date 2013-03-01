// Generated by CozyScript 0.1.1
(function() {
  var Buffer, EventEmitter, Geo, MongoDatabase, assert, cli, collecting, config, decodeLocation, http, options, prompt, properties, twitterstream, _;

  http = require('http');

  Buffer = require('buffer').Buffer;

  EventEmitter = require('events').EventEmitter;

  _ = require('underscore');

  cli = require('cli');

  prompt = require('prompt');

  MongoDatabase = require('./mongo').MongoDatabase;

  Geo = require('./geo').Geo;

  twitterstream = require('twitter-stream');

  config = require('./config');

  assert = require('assert');

  options = cli.parse({
    username: ['u', 'Your twitter username', 'string'],
    password: ['p', 'Your twitter password', 'string'],
    track: ['t', 'The keywords to track', 'string', ''],
    location: ['l', 'Geo-locaton of tweets to collect', 'string', '']
  });

  decodeLocation = function(cb) {
    var geo,
      _this = this;
    if ((options.location != null)) {
      console.log("Decoding the geolocation of " + options.location);
      geo = new Geo;
      return geo.decode(options.location, function(data) {
        var search_bbox, search_bbox_string;
        if ((data.results[0].geometry != null)) {
          console.log(data.results[0].geometry);
          search_bbox = {
            min_lng: data.results[0].geometry.viewport.southwest.lng,
            min_lat: data.results[0].geometry.viewport.southwest.lat,
            max_lng: data.results[0].geometry.viewport.northeast.lng,
            max_lat: data.results[0].geometry.viewport.northeast.lat
          };
          search_bbox_string = "" + search_bbox.min_lng + "," + search_bbox.min_lat + "," + search_bbox.max_lng + "," + search_bbox.max_lat;
          console.log("Constructing flickr bbox search argument: " + search_bbox_string);
          options.bbox = search_bbox_string;
          return cb();
        } else {
          return console.log("Error in decoding geolocation");
        }
      });
    } else {
      return cb();
    }
  };

  prompt.start();

  properties = [
    {
      name: 'username',
      validator: /^[a-zA-Z\s\-_0-9]+$/,
      warning: 'Name must be only letters, spaces, or dashes',
      empty: false
    }, {
      name: 'password',
      hidden: true
    }, {
      name: 'db_username',
      validator: /^[a-zA-Z\s\-]+$/,
      warning: 'Name must be only letters, spaces, or dashes',
      empty: false
    }, {
      name: 'db_password',
      hidden: true
    }
  ];

  collecting = function(cb) {
    return prompt.get(properties, function(err, result) {
      options.username = result.username;
      options.password = result.password;
      config.mongodb.username = result.db_username;
      config.mongodb.password = result.db_password;
      return decodeLocation(cb);
    });
  };

  collecting(function() {
    var get_date, location, mongodb, month, twitter_options, update_date, update_date_function, year, _ref, _ref1,
      _this = this;
    mongodb = new MongoDatabase(config.mongodb);
    mongodb.init();
    twitter_options = {
      screen_name: options.username,
      password: options.password,
      action: 'filter',
      params: {}
    };
    if ((options.track != null) && options.track !== '') {
      twitter_options.params.track = options.track;
    } else {
      if (options.bbox != null) {
        twitter_options.params.locations = options.bbox;
      } else {
        twitter_options.params.locations = '-180,-90,180,90';
      }
    }
    update_date = function() {
      var getDate, min, month, second, year, _ref;
      getDate = function() {
        var date;
        date = new Date();
        return [date.getFullYear(), date.getMonth() + 1, date.getMinutes(), date.getSeconds()];
      };
      _ref = getDate(), year = _ref[0], month = _ref[1], min = _ref[2], second = _ref[3];
      return [
        function(cond) {
          var cur_min, cur_month, cur_second, cur_year, _ref1, _ref2;
          _ref1 = getDate(), cur_year = _ref1[0], cur_month = _ref1[1], cur_min = _ref1[2], cur_second = _ref1[3];
          if ((cond != null)) {
            cond([year, month, min, second], [cur_year, cur_month, cur_min, cur_second]);
          }
          return _ref2 = [cur_year, cur_month, cur_min, cur_second], year = _ref2[0], month = _ref2[1], min = _ref2[2], second = _ref2[3], _ref2;
        }, function() {
          return [year, month, min, second];
        }
      ];
    };
    _ref = update_date(), update_date_function = _ref[0], get_date = _ref[1];
    _ref1 = get_date(), year = _ref1[0], month = _ref1[1];
    location = options.location != null ? ("_" + options.location).replace(/\s/g, "_") : "";
    return mongodb.operate(function(collection) {
      var begin_streaming, stream;
      twitterstream = require('twitter-stream');
      stream = null;
      setInterval(function() {
        return update_date_function(function(old_date, new_date) {
          if (old_date[3] + 10 <= new_date[3]) {
            if (stream != null) {
              stream.abort();
            }
            return begin_streaming();
          }
        });
      }, 10000);
      begin_streaming = function() {
        var collection_keep;
        stream = twitterstream.connect(twitter_options);
        collection_keep = collection;
        stream.on('error', function(err) {
          console.log('error:');
          return console.log(err);
        });
        return stream.on('status', function(tweet) {
          try {
            if (tweet.text != null) {
              console.log(tweet.user.screen_name + ': ' + tweet.text);
              if (collection_keep != null) {
                collection_keep.insert(tweet, {
                  safe: true
                }, function(err, result) {
                  return assert.equal(null, err);
                });
              }
            } else if (tweet.limit != null) {

            } else {
              console.log('ERROR');
              console.log(tweetText);
              throw 'unknown tweet type';
            }
          } catch (error) {
            console.log(error);
          }
          return update_date_function(function(old_date, new_date) {
            var _this = this;
            if (old_date[1] !== new_date[1]) {
              year = new_date[0], month = new_date[1];
              console.log("Create new collection: " + year + "_" + month);
              collection_keep = null;
              mongodb.close();
              return mongodb.operate(function(collection, close_handler) {
                return collection_keep = collection;
              }, "" + config.mongodb.db + location + "_" + year + "_" + month);
            }
          });
        });
      };
      return begin_streaming();
    }, "" + config.mongodb.db + location + "_" + year + "_" + month);
  });

}).call(this);
