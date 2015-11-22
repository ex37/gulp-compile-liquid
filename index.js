var gutil = require('gulp-util');
var through = require('through2');
var fs = require('fs');
var extend = require('util')._extend;

var Liquid = require("liquid-node");
var engine = new Liquid.Engine;


function liquid(data, opts) {

	var options = opts || {};

	return through.obj(function (file, enc, cb) {
		var _data = extend({}, data);

		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-compile-liquid', 'Streaming not supported'));
			return cb();
		}

		try {
			var fileContents = file.contents.toString();

			// Enable gulp-data usage, Extend default data with data from file.data
			if(file.data){
				_data = extend(_data, file.data);
			}
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-compile-liquid', err));
		}

		engine
		.parse(fileContents)
		.then(function(template) { return template.render(_data); })
		.then(function(result) {
			file.contents = new Buffer(result);
		})
		.catch(function(err) {
			this.emit('error', new gutil.PluginError('gulp-compile-liquid', err));
		})
		.finally(function() {
			this.push(file);
			cb();
		});
	});
}

// Expose the Liquid object
liquid.Liquid = Liquid;

module.exports = liquid;
