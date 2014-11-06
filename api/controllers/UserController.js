/**
 * UserController
 *
 * @module		:: Controller
 * @description	:: Contains global users API.
 */

module.exports = {

	currentUserInfo: function (req, res) {
		if (!req.user) {
			return res.json(403, {
				message: 'You\'re not logged on',
				documentation_url: docs_url
			});
		}

		var username = req.user.login || req.user.username;
		var obj = {
			id: id,
			username: username,
			email: null,
			status: {
				main: null,
				rpg: null,
				apocalyptic: null
			},
			lastseen: {
				main: null,
				rpg: null,
				apocalyptic: null
			},
			reg_date: null,
			prefix: null,
			nick_color: null,
			skin_url: 'http://greenusercontent.net/mc/skins/' + username + '.png',
			cape_url: 'http://greenusercontent.net/mc/capes/' + username + '.png',
			banned: null,
			bannedTill: null,
			badges: []
		};

		async.waterfall([

			function findLastseenMain(callback) {
				gcdb.user.getLastseen(username, 'gcmaindb', function (err, result) {
					if (err) return callback(err);

					if (!result) {
						obj.status.main = false;
						callback(null, obj);
					} else {
						if (!result.exit) {
							gcapi.srv.getStatus(cfg.srv.main, function (online) {
								if (online) {
									obj.status.main = true;
								} else {
									obj.status.main = false;
								}

								obj.lastseen.main = result.time;
								callback(null, obj);
							});
						} else {
							obj.status.main = false;

							obj.lastseen.main = result.time;
							callback(null, obj);
						}
					}
				});
			},
			function findLastseenRpg(obj, callback) {
				gcdb.user.getLastseen(username, 'gcrpgdb', function (err, result) {
					if (err) return callback(err);

					if (!result) {
						obj.status.rpg = false;
						callback(null, obj);
					} else {
						if (!result.exit) {
							gcapi.srv.getStatus(cfg.srv.rpg, function (online) {
								if (online) {
									obj.status.rpg = true;
								} else {
									obj.status.rpg = false;
								}

								obj.lastseen.rpg = result.time;
								callback(null, obj);
							});
						} else {
							obj.status.rpg = false;

							obj.lastseen.rpg = result.time;
							callback(null, obj);
						}
					}
				});
			},
			function findLastseenApo(obj, callback) {
				gcdb.user.getLastseen(username, 'gcapodb', function (err, result) {
					if (err) return callback(err);

					if (!result) {
						obj.status.apocalyptic = false;
						callback(null, obj);
					} else {
						if (!result.exit) {
							gcapi.srv.getStatus(cfg.srv.apocalyptic, function (online) {
								if (online) {
									obj.status.apocalyptic = true;
								} else {
									obj.status.apocalyptic = false;
								}

								obj.lastseen.apocalyptic = result.time;
								callback(null, obj);
							});
						} else {
							obj.status.apocalyptic = false;

							obj.lastseen.apocalyptic = result.time;
							callback(null, obj);
						}
					}
				});
			},
			function findRegDateNEmail(obj, callback) {
				gcdbconn.query('SELECT reg_date, email FROM users WHERE login = ?', [username], function (err, result) {
					if (err) return callback(err);

					if (!req.oauth2 || _.contains(req.oauth2.scopes, 'email')) {
						obj.email = result[0].email;
					} else {
						delete obj.email;
						delete result[0].email;
					}

					if (result.length === 0) {
						callback(null, obj);
					} else {
						obj.reg_date = result[0].reg_date;
						callback(null, obj);
					}
				});
			},
			function findPrefixNickColor(obj, callback) {
				maindbconn.query('SELECT prefix, color FROM users WHERE name = ?', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback(null, obj);
					} else {
						obj.prefix = result[0].prefix;
						obj.nick_color = result[0].color;

						callback(null, obj);
					}
				});
			},
			function serializeNickColor(obj, callback) {
				switch (obj.nick_color) {
				case 'a':
					obj.nick_color = 'rff55ff55';
					break;

				case 'b':
					obj.nick_color = 'rff55ffff';
					break;

				case 'c':
					obj.nick_color = 'rffff5555';
					break;

				case 'd':
					obj.nick_color = 'rffff55ff';
					break;

				case 'e':
					obj.nick_color = 'rffffff55';
					break;

				case '1':
					obj.nick_color = 'rff0000aa';
					break;

				case '2':
					obj.nick_color = 'rff00aa00';
					break;

				case '3':
					obj.nick_color = 'rff00aaaa';
					break;

				case '4':
					obj.nick_color = 'rffaa0000';
					break;

				case '5':
					obj.nick_color = 'rffaa00aa';
					break;

				case '6':
					obj.nick_color = 'rffffaa00';
					break;

				case '7':
					obj.nick_color = 'rffaaaaaa';
					break;

				case '8':
					obj.nick_color = 'rff555555';
					break;

				case '9':
					obj.nick_color = 'rff5555ff';
					break;

				default:
					break;
				}

				return callback(null, obj);
			},
			function findBanInfo(obj, callback) {
				maindbconn.query('SELECT `id`, `isBanned`, UNIX_TIMESTAMP(`bannedTill`) AS `bannedTill`, UNIX_TIMESTAMP(NOW()) AS `currentTimestamp` FROM users WHERE name = ?', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback('Incorrect user!');
					} else {
						if (result[0].isBanned) {
							obj.banned = true;
							delete obj.bannedTill;
						} else if (result[0].bannedTill > result[0].currentTimestamp) {
							obj.banned = true;
							obj.bannedTill = result[0].bannedTill;
						} else {
							obj.banned = false;
							delete obj.bannedTill;
						}

						obj.id = result[0].id;

						callback(null, obj);
					}
				});
			},
			function getBadges(obj, callback) {
				gcmainconn.query('SELECT `badgeId`, `badgeData`, UNIX_TIMESTAMP(`first`) AS `first`, `count` FROM badges WHERE player = ?', [obj.id], function (err, result) {
					if (err) return callback(err);

					if (result.length) {
						obj.badges = result;
					}

					callback(null, obj);
				});
			}
		], function (err, obj) {
			if (err) {
				if (err.show) {
					res.status(404).json({
						message: err.message,
						documentation_url: docs_url
					});
				} else {
					throw err;
				}
			}

			res.json(obj);
		});


	},

	userInfo: function (req, res) {
		username = req.params.user.replace(/[^a-zA-Z0-9_-]/g, '');

		if (username !== req.params.user) {
			res.json(404, {
				message: 'User not exists',
				documentation_url: docs_url
			});
		}

		obj = {
			id: null,
			username: null,
			status: {
				main: null,
				rpg: null,
				apocalyptic: null
			},
			lastseen: {
				main: null,
				rpg: null,
				apocalyptic: null
			},
			reg_date: null,
			prefix: null,
			nick_color: null,
			skin_url: null,
			cape_url: null,
			banned: null,
			bannedTill: null,
			badges: []
		};

		async.waterfall([

			function getUser(callback) {
				gcdbconn.query('SELECT id, login FROM users WHERE login = ?', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						res.json(404, {
							message: 'User not exists',
							documentation_url: docs_url
						});
					} else {
						obj.username = result[0].login;
						obj.skin_url = 'http://greenusercontent.net/mc/skins/' + obj.username + '.png';
						obj.cape_url = 'http://greenusercontent.net/mc/capes/' + obj.username + '.png';
						callback(null, obj);
					}
				});
			},
			function preStatusCheck(obj, callback) {
				if (_.contains(cfg.userStatusException, obj.username)) {
					obj.status.main = false;
					obj.status.rpg = false;
					obj.status.apocalyptic = false;

					callback(null, obj);
				} else {
					callback(null, obj);
				}
			},
			function findLastseenMain(obj, callback) {
				gcdb.user.getLastseen(username, 'gcmaindb', function (err, result) {
					if (err) return callback(err);

					if (!result) {
						obj.status.main = false;
						callback(null, obj);
					} else {
						if (!result.exit) {
							gcapi.srv.getStatus(cfg.srv.main, function (online) {
								if (obj.status.main !== false && online) {
									obj.status.main = true;
								} else {
									obj.status.main = false;
								}

								obj.lastseen.main = result.time;
								callback(null, obj);
							});
						} else {
							obj.status.main = false;

							obj.lastseen.main = result.time;
							callback(null, obj);
						}
					}
				});
			},
			function findLastseenRpg(obj, callback) {
				gcdb.user.getLastseen(username, 'gcrpgdb', function (err, result) {
					if (err) return callback(err);

					if (!result) {
						obj.status.rpg = false;
						callback(null, obj);
					} else {
						if (!result.exit) {
							gcapi.srv.getStatus(cfg.srv.rpg, function (online) {
								if (obj.status.rpg !== false && online) {
									obj.status.rpg = true;
								} else {
									obj.status.rpg = false;
								}

								obj.lastseen.rpg = result.time;
								callback(null, obj);
							});
						} else {
							obj.status.rpg = false;

							obj.lastseen.rpg = result.time;
							callback(null, obj);
						}
					}
				});
			},
			function findLastseenApo(obj, callback) {
				gcdb.user.getLastseen(username, 'gcapodb', function (err, result) {
					if (err) return callback(err);

					if (!result) {
						obj.status.apocalyptic = false;
						callback(null, obj);
					} else {
						if (!result.exit) {
							gcapi.srv.getStatus(cfg.srv.apocalyptic, function (online) {
								if (obj.status.apocalyptic !== false && online) {
									obj.status.apocalyptic = true;
								} else {
									obj.status.apocalyptic = false;
								}

								obj.lastseen.apocalyptic = result.time;
								callback(null, obj);
							});
						} else {
							obj.status.apocalyptic = false;

							obj.lastseen.apocalyptic = result.time;
							callback(null, obj);
						}
					}
				});
			},
			function findRegDate(obj, callback) {
				gcdbconn.query('SELECT UNIX_TIMESTAMP(reg_date) AS reg_date FROM users WHERE login = ?', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback(null, obj);
					} else {
						obj.reg_date = result[0].reg_date;
						callback(null, obj);
					}
				});
			},
			function findPrefixNickColor(obj, callback) {
				maindbconn.query('SELECT prefix, color FROM users WHERE name = ?', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback(null, obj);
					} else {
						obj.prefix = result[0].prefix;
						obj.nick_color = result[0].color;

						callback(null, obj);
					}
				});
			},
			function serializeNickColor(obj, callback) {
				switch (obj.nick_color) {
				case 'a':
					obj.nick_color = 'rff55ff55';
					break;

				case 'b':
					obj.nick_color = 'rff55ffff';
					break;

				case 'c':
					obj.nick_color = 'rffff5555';
					break;

				case 'd':
					obj.nick_color = 'rffff55ff';
					break;

				case 'e':
					obj.nick_color = 'rffffff55';
					break;

				case '1':
					obj.nick_color = 'rff0000aa';
					break;

				case '2':
					obj.nick_color = 'rff00aa00';
					break;

				case '3':
					obj.nick_color = 'rff00aaaa';
					break;

				case '4':
					obj.nick_color = 'rffaa0000';
					break;

				case '5':
					obj.nick_color = 'rffaa00aa';
					break;

				case '6':
					obj.nick_color = 'rffffaa00';
					break;

				case '7':
					obj.nick_color = 'rffaaaaaa';
					break;

				case '8':
					obj.nick_color = 'rff555555';
					break;

				case '9':
					obj.nick_color = 'rff5555ff';
					break;

				default:
					break;
				}

				callback(null, obj);
			},
			function findBanInfo(obj, callback) {
				maindbconn.query('SELECT `id`, `isBanned`, UNIX_TIMESTAMP(`bannedTill`) AS `bannedTill`, UNIX_TIMESTAMP(NOW()) AS `currentTimestamp` FROM users WHERE name = ?', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback('Incorrect user!');
					} else {
						if (result[0].isBanned) {
							obj.banned = true;
							delete obj.bannedTill;
						} else if (result[0].bannedTill > result[0].currentTimestamp) {
							obj.banned = true;
							obj.bannedTill = result[0].bannedTill;
						} else {
							obj.banned = false;
							delete obj.bannedTill;
						}

						obj.id = result[0].id;

						callback(null, obj);
					}
				});
			},
			function getBadges(obj, callback) {
				gcmainconn.query('SELECT `badgeId`, `badgeData`, UNIX_TIMESTAMP(`first`) AS `first`, `count` FROM badges WHERE player = ?', [obj.id], function (err, result) {
					if (err) return callback(err);

					if (result.length) {
						obj.badges = result;
					}

					callback(null, obj);
				});
			}
		], function (err, obj) {
			if (err) {
				throw err;
			}

			res.json(obj);
		});
	},

	regions_list: function (req, res) {
		/* Array of objects:
			{
				name: 'KernCastle',
				rights: ['build','full']
			}
		*/

		async.waterfall([
			function getUserLogin(callback) {

				gcdb.user.getByLogin(req.user.username, 'maindb', function (err, uid) {
					if (err) return callback(err);

					callback(null, uid);
				});
			},
			function getRegionsWhereUserHaveRights(uid, callback) {
				gcmainconn.query('SELECT `region` AS `name`, `right` AS `rights` FROM regions_rights WHERE `entityType` = 1 AND `entityId` = ?', [uid], function (err, regions) {
					if (err) return callback(err);

					callback(null, regions);
				});
			},
			function findEqualObjects(regions, callback) {
				regions = regions.map(function (element, index) {
					element.rights = [element.rights];

					regions.forEach(function (el, ix) {
						if (element.name === el.name && !(el.rights instanceof Array) && element.rights !== el.rights) {
							element.rights.push(el.rights);
							delete regions[ix];
						}
					});

					return element;
				});

				regions = regions.filter(function (n) {
					return n
				});

				callback(null, regions);
			},
			function getRegionNamesNSerializeRights(regions, callback) {
				async.map(regions, function (element, callback) {
					gcmainconn.query('SELECT `name` FROM regions WHERE `id` = ?', [element.name], function (err, name) {
						if (err) return callback(err);

						element.name = name[0].name;
						element.rights = element.rights.map(function (element) {
							return gcapi.getRightById(element);
						});

						callback(null, element);
					});
				}, callback);
			}
		], function (err, obj) {
			if (err) throw err;

			res.json(obj);
		});
	}

};
