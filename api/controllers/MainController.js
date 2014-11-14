/**
 * MainController
 *
 * @module		:: Controller
 * @description	:: GC.Main API.
 */

var moment = require('moment');
moment.lang('ru');

module.exports = {

	status: function (req, res) {
		var obj = {
			server: 'Main',
			status: null,
			online: null
		};

		async.waterfall([
			function getServerStatus(callback) {
				gcapi.srv.getStatus(cfg.srv.main, function (online) {
					obj.status = online;

					callback(null, obj);
				});
			},
			function getPlayersCount(obj, callback) {
				gcmainconn.query('SELECT online FROM log_online ORDER BY timestamp DESC LIMIT 1', function (err, result) {
					if (err) return callback(err);

					if (result.length === 0 || !obj.status) {
						callback(null, obj);
					} else {
						obj.online = result[0].online;

						callback(null, obj);
					}
				});
			}
		], function (err, obj) {
			if (err) {
				if (!err.show) return res.serverError(err);
			}

			res.json(obj);
		});
	},

	online: function (req, res) {
		var obj = [];

		gcmainconn.query('SELECT login FROM login_log WHERE `exit` IS NULL ORDER BY login ASC', function (err, result) {
			if (err) return res.serverError(err);

			if (result.length === 0) {
				res.json(obj);
			} else {
				async.each(result, function (element, callback) {
					if (!(_.contains(cfg.userStatusException, element.login))) {
						obj.push(element.login);
					}

					callback(null);
				}, function () {
					res.json(obj);
				});

			}
		});
	},

	economy: function (req, res) {
		async.waterfall([
			function getCachedValue(callback) {
				redis.get('main.economy', function (err, result) {
					if (err) return callback(err);
					
					try {
						// 900000 ms = 15 mins
						if (result && JSON.parse(result)[time] <= 900000) {
							callback(null, result);
						} else {
							callback(null, null);
						}
					} catch (err) {
						callback(err);
					}
				});
			},
			function processValueAndCache(value, callback) {
				if (value) {
					value = JSON.parse(value);
					
					callback(null, value);
				} else {
					gcmainconn.query('SELECT SUM(`buyMoney` + `sellMoney`) AS `dailymoney` FROM `chestshop_logs` WHERE `time` > NOW() - INTERVAL 1 DAY AND `shopOwner` NOT LIKE `customer`', function (err, result) {
						if (err) return callback(err);
						
						result[0].time = Math.floor(Date.now() / 1000);
						
						redis.set('main.economy', JSON.stringify(result[0]), function (err) {
							if (err) return callback(err);

							callback(null, result[0]);
						});
					});
				}
			}
		], function (err, result) {
			if (err) return res.json(err);//return res.serverError(err);
			
			res.json({
				economy: {
					dailymoney: result.dailymoney
				},
				time: result.time
			});
		});
	},

	namedColorsJSON: function (req, res) {
		async.waterfall([
			function getNamedColors(callback) {
				var query = 'SELECT name, localizedName, h, s, pioneer, UNIX_TIMESTAMP(opened) AS opened, secondPioneer, UNIX_TIMESTAMP(repeated) AS repeated FROM `named_colors`';

				gcmainconn.query(query, function (err, result) {
					if (err) return callback(err);

					callback(null, result);
				});
			},
			function setLogins(obj, callback) {
				async.map(obj, function (element, callback) {
					if (element.pioneer === -1) {
						element.pioneer = "System color";
						element.secondPioneer = "System color";

						return callback(null, element);
					}

					gcdb.user.getByID(element.pioneer, 'maindb', function (err, result) {
						if (err) return callback(err);

						element.pioneer = result;

						gcdb.user.getByID(element.secondPioneer, 'maindb', function (err, result) {
							if (err) return callback(err);

							element.secondPioneer = result;

							callback(null, element);
						});
					});
				}, function (err, obj) {
					if (err) return callback(err);

					callback(null, obj);
				});
			}
		], function (err, obj) {
			if (err) return res.serverError(err);

			res.json(obj);
		});
	},

	namedColorsHTML: function (req, res) {
		async.waterfall([

			function getNamedColors(callback) {
				var query = 'SELECT name, localizedName, h, s, pioneer, opened, secondPioneer, repeated FROM `named_colors` ORDER BY h ASC, s ASC';

				gcmainconn.query(query, function (err, result) {
					if (err) return callback(err);

					callback(null, result);
				});
			},
			function setLogins(obj, callback) {
				async.map(obj, function (element, callback) {
					if (element.pioneer === -1) {
						element.pioneer = "System color";
						element.secondPioneer = "System color";

						return callback(null, element);
					}

					gcdb.user.getByID(element.pioneer, 'maindb', function (err, result) {
						if (err) return callback(err);

						element.pioneer = result;

						gcdb.user.getByID(element.secondPioneer, 'maindb', function (err, result) {
							if (err) return callback(err);

							element.secondPioneer = result;
							callback(null, element);
						});
					});
				}, function (err, obj) {
					if (err) return callback(err);

					callback(null, obj);
				});
			}
		], function (err, obj) {
			if (err) return res.serverError(err);

			res.view('namedColors', {
				obj: obj,
				moment: moment
			});
		});
	},

	items: function (req, res) {
		async.waterfall([

			function getItems(callback) {
				var query = 'SELECT `id`, `data`, `name`, `image` AS `image_url` FROM `items`';

				maindbconn.query(query, function (err, result) {
					if (err) return callback(err);

					callback(null, result);
				});
			},
			function serializeItems(obj, callback) {
				async.map(obj, function (element, callback) {
					element.image_url = 'https://greencubes.org/img/items/' + element.image_url;

					callback(null, element);
				}, function (err, result) {

					callback(null, result);
				});
			}
		], function (err, obj) {
			if (err) return res.serverError(err);

			res.json(obj);
		});
	},

	region_info: function (req, res) {
		var obj = {
			name: req.param('name'),
			parent: null,
			flags: {}, // { 'flow': 0, 'fire': 0 }
			full_access: [],
			build_access: [],
			coordinates: {
				first: null, // '-420 34 -1337
				second: null
			}
		};

		async.waterfall([
			function checkData(callback) {

				if (obj.name !== obj.name.replace(/[^a-zA-Z0-9_-]/g, '')) {
					return res.json(400, {
						message: 'Illegal symbols in region\'s name',
						documentation_url: docs_url
					});
				}

				callback(null, obj);
			},
			function getRegion(obj, callback) {
				gcmainconn.query('SELECT * FROM regions WHERE `name` = ?', [obj.name], function (err, region) {
					if (err) return callback(err);

					if (!region.length) {
						return res.json(404, {
							message: 'Region not found',
							documentation_url: docs_url
						});
					}

					callback(null, {
						id: region[0].id,
						name: region[0].name,
						parent: region[0].parent,
						flags: region[0].flags,
						full_access: obj.full_access,
						build_access: obj.build_access,
						coordinates: {
							first: '' + region[0].minx + ' ' + region[0].miny + ' ' + region[0].minz,
							second: '' + region[0].maxx + ' ' + region[0].maxy + ' ' + region[0].maxz
						}
					});
				});
			},
			function serializeParent(obj, callback) {
				if (obj.parent) {
					gcmainconn.query('SELECT `name` FROM regions WHERE `id` = ?', [obj.parent], function (err, region) {
						if (err) return callback(err);

						if (region.length) {
							obj.parent = region[0].name;
						} else {
							obj.parent = null;
						}

						callback(null, obj);
					});
				} else {
					obj.parent = null;

					callback(null, obj);
				}
			},
			function serializeFlags(obj, callback) {
				var temp = obj.flags.split(',');

				obj.flags = {};

				temp.forEach(function (element) {
					var el = element.split(':');

					obj.flags[el[0]] = el[1];
				});

				callback(null, obj);
			},
			function getRights(obj, callback) {
				gcmainconn.query('SELECT * FROM regions_rights WHERE region = ?', [obj.id], function (err, rights) {
					if (err) return callback(err);

					for (var i = 0; i < rights.length; i++) {
						/* right id: full - 0, build - 2, grant - 1, create_child - 9 */
						if (rights[i].right === 0) {
							if (rights[i].entityType === 1) {
								obj.full_access.push(rights[i].entityId);
							}

							if (rights[i].entityType === 2) {
								obj.full_access.push('o:' + rights[i].entityId);
							}

							if (rights[i].entityType === 3) {
								obj.full_access.push('all');
							}
						}

						if ([1, 2, 9].indexOf(rights[i].right) !== -1) {
							if (rights[i].entityType === 1) {
								obj.build_access.push(rights[i].entityId);
							}

							if (rights[i].entityType === 2) {
								obj.build_access.push('o:' + rights[i].entityId);
							}

							if (rights[i].entityType === 3) {
								obj.build_access.push('all');
							}
						}
					}

					obj.full_access = obj.full_access.filter(function (elem, pos) {
						return obj.full_access.indexOf(elem) === pos;
					});

					obj.build_access = obj.build_access.filter(function (elem, pos) {
						return obj.build_access.indexOf(elem) === pos;
					});

					callback(null, obj);
				});
			},
			function serializeFull_accessPlayers(obj, callback) {
				async.map(obj.full_access, function (element, callback) {

					if (typeof (element) === 'number') {
						gcdb.user.getByID(element, 'maindb', function (err, login) {
							if (err) return callback(err);

							callback(null, login);
						});
					} else {
						callback(null, element);
					}
				}, function (err, array) {
					if (err) return callback(err);

					obj.full_access = array;

					callback(null, obj);
				});
			},
			function serializeBuild_accessPlayers(obj, callback) {
				async.map(obj.build_access, function (element, callback) {
					if (typeof (element) === 'number') {
						gcdb.user.getByID(element, 'maindb', function (err, login) {
							if (err) return callback(err);

							callback(null, login);
						});

					} else {
						callback(null, element);
					}
				}, function (err, array) {
					if (err) return callback(err);

					obj.build_access = array;

					callback(null, obj);
				});
			}
		], function (err, obj) {
			if (err) return res.serverError(err);

			delete obj.id;

			res.json(obj);
		});
	}
};
