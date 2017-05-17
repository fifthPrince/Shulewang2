var dbop = require('./dbOperation.js');

dbop.getUser('ehuajig', function(err, user) {
  //console.log(user);
});

dbop.getSingleProduct(001, function(err, user) {
  //console.log(user);
});

dbop.getSingleProductWithFriendsRemark(001,001,function(err, rows){
  console.log("getSingleProductWithFriendsRemark start");
  console.log(rows.length);
  var numlike = 0;
  for (var i=0; i<rows.length; i++) {  
     console.log(rows[i]);  
     if(rows[i].total_score>12){
       numlike++;
     }
  } 
  console.log("how many " + numlike);
  console.log("getSingleProductWithFriendsRemark end");
});

//getSingleProductReOrder
dbop.getSingleProductReOrder(001,function(err, rows){
  //console.log(rows.length);
});

dbop.getSystemRecommendations(function(err, products) {
  console.log('System recommendations start');
  console.log(products);
  console.log('System recommendations end');
});

dbop.getFriendsRecommendations(1, function(err, products) {
  console.log('Friends recommendations start');
  console.log(products);
  console.log('Friends recommendations end');
});

dbop.insertOrderIntoDatabase(1, 1, function(err, products) {

});


dbop.closeDb();
