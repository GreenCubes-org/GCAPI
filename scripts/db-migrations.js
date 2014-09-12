/* Configuration */
var migrations = [
	{ table: 'client', column: 'internal', type: 'varchar(2)' }
];

/* Example config:
var tables = [
	{ column: 'client', type: 'varchar(2) }
];
*/

/* Main logic */
var mysql = require('mysql');
var async = require('../node_modules/sails/node_modules/async');
var cfg = require('../config/local');

console.log('[DB-MIGRATIONS] Start script');

console.log('[DB-MIGRATIONS] Check config: \n', migrations);

if (migrations.length) {
	console.log('[DB-MIGRATIONS] OK. Not empty config.');
} else {
	console.log('[DB-MIGRATIONS] NOT OK. Empty config! QUIT.');
	process.exit(0);
}

console.log('[DB-MIGRATIONS] Create connection to DB');

var db = mysql.createConnection({
	host: cfg.appdb.host,
	database: cfg.appdb.database,
	user: cfg.appdb.user,
	password: cfg.appdb.password
});

console.log('[DB-MIGRATIONS] Connect to DB');

db.connect();

function migrate(migrations, cb) {
	async.each(migrations, function (migrate, callback) {
		db.query('ALTER TABLE ' + migrate.table + ' ADD ' + migrate.column + ' ' + migrate.type, function (err, result) {
			if (err) {
				if (err.code === 'ER_DUP_FIELDNAME') {
					console.log('[DB-MIGRATIONS] ALTER TABLE ' + migrate.table + ' ADD ' + migrate.column + ' ' + migrate.type + ' - ALREADY CREATED');
					return callback(null);
				}

				callback(err);
			}

			console.log('[DB-MIGRATIONS] ALTER TABLE ' + migrate.table + ' ADD ' + migrate.column + ' ' + migrate.type + ' - SUCCESS');
			callback(null);
		})
	}, function (err) {
		if (err) {
			console.error('[DB-MIGRATIONS] ERROR. I\'M SO SORRY. Here is your err var:\n', err);
			throw err;
		}

		console.log('[DB-MIGRATIONS] DONE. GOODBYE.');
		process.exit(0);
	});
};

console.log('[DB-MIGRATIONS] Processing commands:');

migrate(migrations);
