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
