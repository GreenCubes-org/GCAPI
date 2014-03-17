// For debugging
//require('look').start(3000);

// Start sails and pass it command line arguments
require('sails').lift(require('optimist').argv);
