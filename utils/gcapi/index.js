var net = require('net');

module.exports.srv = srv = {

	getStatus: function getStatus(srvCfg, cb) {
		var sock = new net.Socket();

		sock.setTimeout(500);
		sock.on('connect', function() {
			sock.destroy();

			cb(true);
		}).on('error', function(e) {
			cb(false);
		}).connect(srvCfg.port, srvCfg.host);
	}

};

/**
 * Return a unique identifier with the given `len`.
 *
 *     gct.generateUID(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
module.exports.generateUID = function(len) {
  var buf = []
    , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    , charlen = chars.length;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};

/**
 * Return a random int, used by `gct.generateUID()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
