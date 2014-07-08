var net = require('net');

module.exports.getRightById = getRightById = function getRightById(id) {
	switch (id) {
		case 0:
			return 'full';

		case 1:
			return 'grant';

		case 2:
			return 'build';

		case 3:
			return 'grant-child';

		case 4:
			return 'build-child';

		case 5:
			return 'flow';

		case 6:
			return 'fire';

		case 7:
			return 'grant-grant-child';

		case 8:
			return 'grant-grant';

		case 9:
			return 'create-child';

		case 10:
			return 'delete';

		case 11:
			return 'place';

		case 12:
			return 'break';

		default:
			return;
	};
};

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
    , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./'
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
