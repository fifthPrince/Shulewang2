module.exports = function(app, logger) {

  // Use body-parser to handle HTTP post
  var bodyParser = require('body-parser');
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  // Session setup
  // req.session.prop
  var uuid = require('node-uuid');
  var session = require('express-session');
  var SQLiteStore = require('connect-sqlite3')(session);
  var sessionOpts = {
    genid: function(req) {
      return uuid.v1();
    },
    store : new SQLiteStore,
    secret: 'I,dont,know,the,secret.^_^',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false, maxAge: 3600000 /* 1 hour */} // Opt {secure:true} only works for HTTPS connection!!!
  };
  app.use(session(sessionOpts));

  var dbop = require('./dbOperation.js');
  process.on('SIGINT', function() {
    logger.info('Close DB connection through app termination.');
    dbop.closeDb();
    process.exit(0);
  });

  var async = require('async');

  var loginChecker = function(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      res.redirect(303, '/login');
    }
  }

  app.get('/*', function(req, res, next) {
    // Set res.locals
    // Maybe it's not a good idea to get session data every time.
    logger.info('REQ ' + req.path);
//  res.locals.user = req.session.user ? req.session.user : null;
    res.locals.session = req.session;
    if (req.session.user) {
      logger.debug('Hi ' + req.session.user.name);
    } else {
      logger.warn('Not logged in.');
    }

    next(); // Jump to next middleware
  });
  
  app.get('/', function(req, res) {
    var products = {
      from_friends: [
//      {type: 'Apple' , name: '', picAddr: 'apple.png',  price: 27},
//      {type: 'Banana', name: '', picAddr: 'banana.png', price: 30},
//      {type: 'Grape' , name: '', picAddr: 'grape.png',  price: 29},
//      {type: 'Orange', name: '', picAddr: 'orange.png', price: 22},
      ],
      from_system : [
//      {type: 'Apple' , name: '', picAddr: 'apple.png',  price: 27},
//      {type: 'Pear'  , name: '', picAddr: 'pear.png',   price: 26},
//      {type: 'Orange', name: '', picAddr: 'orange.png', price: 22},
//      {type: 'Banana', name: '', picAddr: 'banana.png', price: 30},
//      {type: 'Grape' , name: '', picAddr: 'grape.png',  price: 29},
      ],
      new_arrivals: [
        {type: 'Watermelon', name: '', picAddr: 'watermelon.png',  price: 29},
        {type: 'Watermelon', name: '', picAddr: 'watermelon.png',  price: 29},
        {type: 'Watermelon', name: '', picAddr: 'watermelon.png',  price: 29},
      ]
    };
    async.waterfall(
      [
        function(callback) {
          var userId = req.session.user ? req.session.user.id : 0;
          dbop.getFriendsRecommendations(userId, function(err, result) {
            if (!err && products) {
              products.from_friends = result;
            }
            callback(null);
          });
        },
        function(callback) {
          dbop.getSystemRecommendations(function(err, result) {
            if (!err && products) {
              products.from_system = result;
            }
            callback(null);
          });
         }
      ],
      function(err, result) {
        res.render('index', {products: products});
      }
    );
  });
  
  app.get('/demo', function(req, res) {
    res.render('demo', {
      name: req.query.name ? req.query.name : 'Simon',
      count: 10
    });
  });

  app.get('/product', loginChecker, function(req, res) {
    var product_id = req.query.productId;
    var user_id = req.session.user.id
    logger.info("product_id=" + product_id +", user_id=" +user_id+ ", req.session.user.name=" + req.session.user.name);

    var productInfo;
    var likeNum = 0;
    var unlikeNum = 0;
    var likePeople = [];
    var unlikePeople = [];

    var first_purchases_rate = 0;
    var second_purchases_rate = 0;
    var third_purchases_rate = 0;
    var fourth_purchases_rate = 0;
    

    var tmp_peopleLike = [];
    var tmp_peopleUnlike = [];

    async.waterfall(
      [
        function(callback) {
          dbop.getSingleProduct(product_id, function(err, product) {
            if (!err && product) {
            productInfo = {id: product.id, name: product.name, price: product.price, picAddr: product.picAddr, description: product.description, type: product.type};
	    logger.info(productInfo);
            }
            callback(null);    
          });   
         },

         function(callback) {
           dbop.getSingleProductWithFriendsRemark(product_id, user_id, function(err, rows) {

           if (!err && rows) {
             for (var i=0; i< rows.length; i++) {  
               //console.log(rows[i]);  
               if(rows[i].total_score >= 12){
                 likeNum++;
                 tmp_peopleLike[tmp_peopleLike.length] = rows[i].person_id;
               }else{
	         unlikeNum++;
                 tmp_peopleUnlike[tmp_peopleUnlike.length] = rows[i].person_id;
               } 
             }
             logger.info("like numbers="+likeNum+", unlike numbers="+unlikeNum);
             //logger.info("peopleLike=" +tmp_peopleLike+ ", peopleUnlike=" + tmp_peopleUnlike);

             
           }
           callback(null); 
           }); 
          },

          function(callback) {
            dbop.getPersonInfoFromUserId(tmp_peopleLike.join(","), function(err, persons) {
               if (!err && persons) {
                 for(var j=0; j<persons.length; j++){
                     likePeople[likePeople.length] = persons[j].picAddr;
                     logger.info("like people:" + persons[j].name);
                 }
               }
             callback(null);
             });
           },

          function(callback) {
            dbop.getPersonInfoFromUserId(tmp_peopleUnlike.join(","), function(err, persons) {
               if (!err && persons) {
                 for(var j=0; j<persons.length; j++){
                     unlikePeople[unlikePeople.length] = persons[j].picAddr;
                     logger.info("un-like people:" + persons[j].name);
                 }
               }
             callback(null);
             });
           },

          function(callback) {
            dbop.getSingleProductReOrder(product_id, function(err, orders) {
               if (!err && orders) {
                 var sum = 0;
                 for(var i= 0; i< orders.length; i++){
                   //logger.info("nums=" + orders[i].nums);
                   sum = sum + orders[i].nums;
                 }
                 //logger.info("sum=" + sum);
                 if (sum > 0) {
                 first_purchases_rate = (orders[0].nums/ sum) * 100;
                 first_purchases_rate = first_purchases_rate.toFixed(2);
                 if (orders.length >= 2) {
                   second_purchases_rate = (orders[1].nums/ sum) * 100;
                   second_purchases_rate = second_purchases_rate.toFixed(2);
                 }
                 if (orders.length >= 3) {
                   third_purchases_rate = (orders[2].nums/ sum) * 100;
                   third_purchases_rate = third_purchases_rate.toFixed(2);
                 }
                 if (orders.length >= 4) {
                   fourth_purchases_rate = (orders[3].nums/ sum) * 100;
                   fourth_purchases_rate = fourth_purchases_rate.toFixed(2);
                 }
                 }
                 //logger.info("purchase rate="+ sum +":" + first_purchases_rate);
               }
             callback(null);
             });
           }

       ],

       function(err, result) {
          res.render('product',{
          singleProduct: productInfo, 
          recommandation: {like: likeNum, unlike: unlikeNum},
          likeList: likePeople,
          unlikeList: unlikePeople,
          //likeList: ['eeijjmq.jpg', 'eguanwu.jpg', 'ehuajig.jpg','ewzabdm.jpg', 'ezaocen.jpg', 'eacefhk.jpg'],
          //unlikeList: ['ewzabdm.jpg', 'ezaocen.jpg', 'eacefhk.jpg'],
          purchaseRate: {first: first_purchases_rate, second: second_purchases_rate, third: third_purchases_rate, fourth: fourth_purchases_rate}
	  //purchaseRate: {first: 700, second: 300, third: 150, fourth: 50}
          });
       }
    );

  });
  
  app.get('/addToCart', function(req, res) {
  
      logger.info("add into product " + req.query.productId);
      req.session.wantToBuyList = req.query.productId;
      var userName = req.session.user;
      logger.info("add into product 2 why not " + userName);
      console.log(req.session);
      res.render('cart',{productId:req.query.productId});
  
  });

  app.get('/cart', function(req,res) {
    req.session.cart = [];
    var productId = req.query.productId ? req.query.productId : 0;
    logger.debug('Product ID is ', productId);

    if (productId) {
      req.session.wantToBuyList = productId;
      dbop.getSingleProduct(productId, function(err, product) {
        logger.debug('Going to query product ' + productId);
        if (!err && product) {
          product.number = 1; // Default to 1
          req.session.cart = [];
          req.session.cart.push(product);
        } else {
          logger.debug('Product query error.');
        }
        console.log('Cart is: ');
        console.log(req.session.cart);
        res.render('cart', {cart: {item: req.session.cart}});
      });
    } else {
      res.render('cart', {cart: {item: req.session.cart}});
    }
//  var cart = {
//    item: [
//      {name:'Apple', price: 26, productCode: 'S-12451', number:1},
//      {name:'Apple', price: 26, productCode: 'S-12452', number:3},
//      {name:'Apple', price: 26, productCode: 'S-12453', number:2},
//    ]
//  }
//  res.render('cart', {cart: cart});
  });  
  
   
 app.get('/insertOrderIntoDB',function(req,res) {
    var productId = req.session.wantToBuyList;
    var userId = req.session.user.id;
    logger.info("In the insertOrderIntoDB productId is  " + productId);
    logger.info("In the insertOrderIntoDB userName is  " + userId);
    dbop.insertOrderIntoDatabase(productId, userId, function(err,result){
    if (err) {
      console.log('insertOrderIntoDatabase error in route.js');
      callback(err, {});
    } else {
         console.log('insertOrderIntoDatabase sucess in route.js');
      var productId = req.session.wantToBuyList;
      req.session.cart = [];
      dbop.getSingleProduct(productId, function(err, product) {
        if (!err && product) {
          product.number = 1; // Default to 1
          req.session.cart.push(product);
        } else {
          logger.debug('No such product ' + productId);
        }
        res.render('cart', {cart: {item: req.session.cart}, isShowJudgement:true});
      });
//      res.render('cart',{isShowJudgement:true});   
    } 
    
    });
    
  });

  app.get('/questionair',function(req,res) {
    logger.info("step to questionair");
    var productId = req.session.wantToBuyList;
    var userName = req.session.user.name;
    res.render('questionair',{productId:productId, userName:userName});
  });

  app.post('/order_evaluation',function(req,res) {
    logger.info("step to order evaluation");
    console.log(req.body);
    var shape_score=req.body.rb_shape;
    var taste_score=req.body.rb_taste;
    var logistic_score=req.body.rb_logistic;
    var service_score=req.body.rb_service;
    var person_id = req.session.user.id;
    var product_id = req.session.wantToBuyList;
    
    //var person_id=003;
    //var product_id=001;
    logger.info('Try to update order evaluation to OrderList ' 
                + ' person_id: ' + person_id
                + ' product_id: ' + product_id
                + ' shape_score: ' + shape_score
                + ' taste_score: ' + taste_score
                + ' logistic_score: ' + logistic_score
                + ' service_score: ' + service_score);
    dbop.orderEvaluation(person_id, product_id, shape_score, taste_score, logistic_score, service_score, function(err, order) {
      if (!err && order) {
        logger.info('Update OrderList successfully with ' 
                    + ' person_id: ' + order.person_id 
                    + ' product_id: ' + order.product_id
                    + ' shape_score: ' + order.shape_score
                    + ' taste_score: ' + order.taste_score
                    + ' logistic_score: ' + order.logistic_score
                    + ' service_score: ' + order.service_score
                    + ' total_score: ' + order.total_score);
      }
      res.redirect(303, '/');
    });
  });

  app.get('/login', function(req, res) {
    res.render('login', {
      layout: null
    });
  });

  app.get('/logout', function(req, res) {
    delete req.session.user;
    delete req.session.cart;
    res.redirect(303, '/');
  });

  app.post('/auth', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    logger.debug(username + ' ' + password);

    dbop.getUser(username, function(err, user) {
      if (!err && user) {
        req.session.user = {id: user.id, signum: user.signum, name: user.name, image: user.picAddress};
      }
      res.redirect(303, '/');
    });

  });

  // Customize 404 page
  // Last request handler.
  app.use(function(req, res) {
    res.status(404);
    res.render('404', {layout: null});
  });
  
  // Customize 500 page
  // Last error handler.
  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500', {layout: null});
  });
};
