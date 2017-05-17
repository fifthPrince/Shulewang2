var express = require('express');
var exphbs  = require('express-handlebars');

var app = express(); // 

var handlebars = exphbs.create({
	defaultLayout: 'common',
	extname: '.hbs',
	helpers : {
	  times: function(n, options) {
	    var accum = '';
	    for (var i=0; i<n; i++) {
	      accum += options.fn(i);
      }
      return accum;
    },
    multi: function(m,n,options){
     return m*n;
    }
	}
});

var logger = require('log4js').getLogger();

app.set('port', process.env.PORT || 8080);
app.set('trust proxy', true);

logger.info('Set static directory');
app.use(express.static(__dirname + '/public'));

app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');

logger.info('Load route settings.');
require('./route.js')(app, logger);

app.listen(app.get('port'), function() {
    logger.info('Express started on http://localhost:'+app.get('port'));
	logger.info('Press Ctrl+C to terminate.');
  }
);
