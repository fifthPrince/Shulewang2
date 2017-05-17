var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('shulewangDatabase.db');
 
//db.serialize(function() {
//});

exports.getUser = function(signum, callback) {
//console.log('Get signum %s.', signum);

  // Get first row
  db.get("SELECT * FROM Persons WHERE signum=?", signum, function(err, row) {
    if (err) {
      callback(err, {});
    } else {
      callback(null, {id: row.id, signum: row.signum, name: row.name});
    }
  });
}

exports.getFriendsRecommendations = function(userid, callback) {
  db.all("SELECT " +
          "Products.*,MAX(OrderList.total_score) AS total_score " +
          "FROM Products,OrderList,Relationship " +
          "WHERE Products.id=OrderList.product_id AND OrderList.person_id=Relationship.friends_id AND Relationship.person_id=?" +
          "GROUP BY Products.id LIMIT 10", userid, function(err, rows) {
    if (err) {
      callback(err, []);
    } else {
      var products = [];
      for (var i in rows) {
        products.push({
          'id'     : rows[i].id,
          'type'   : rows[i].type,
          'name'   : rows[i].name,
          'price'  : rows[i].price,
          'picAddr': rows[i].picAddr
        });
      }
      callback(null, products);
    }
  });
}

exports.getSystemRecommendations = function(callback) {
  db.all("SELECT " +
          "Products.*,MAX(OrderList.total_score) AS total_score " +
          "FROM Products,OrderList " +
          "WHERE Products.id=OrderList.product_id " +
          "GROUP BY Products.id LIMIT 10", function(err, rows) {
    if (err) {
      callback(err, []);
    } else {
      var products = [];
      for (var i in rows) {
        products.push({
          'id'     : rows[i].id,
          'type'   : rows[i].type,
          'name'   : rows[i].name,
          'price'  : rows[i].price,
          'picAddr': rows[i].picAddr
        });
      }
      callback(null, products);
    }
  });
}

exports.closeDb = function()
{
  db.close();
}


exports.getSingleProduct = function(productId, callback){
    
    db.get("SELECT * FROM Products WHERE id=?", productId, function(err, row) {
    if (err) {
      callback(err, {});
    } else {
      callback(null, {id: row.id, name: row.name, price: row.price, picAddr: row.picAddr, description: row.description, type: row.type});
    }
  });

}

exports.getSingleProductLikeList = function(productId, callback){
    
    db.get("SELECT * FROM Products WHERE id=?", productId, function(err, row) {
    if (err) {
      callback(err, {});
    } else {
      callback(null, {id: row.id, name: row.name, price: row.price, picAddr: row.picAddr, description: row.description});
    }
  });

}

exports.getUserIdFromUserName = function(userName, callback){
     
  db.get("SELECT * FROM Persons WHERE name=?", userName, function(err, row) {
    if (err) {
      callback(err, {});
    } else {
      callback(null, {id: row.id, signum: row.signum, name: row.name});
    }
  });

}

//AND person_id in (select friends_id from Relationship where person_id = ?) ordered by service_score
exports.getSingleProductWithFriendsRemark = function( product_id, user_id, callback ){
  db.all("SELECT * FROM OrderList WHERE product_id=? AND person_id in (select friends_id from Relationship where person_id = ? union select person_id from Relationship where friends_id = ?) ORDER BY service_score DESC", product_id, user_id, user_id, function(err, rows) {
  if (err) {
     callback(err, {});
  } else {
    callback(null, rows);
  }

  }); 
}

exports.getPersonInfoFromUserId = function(userId, callback){
  db.all("SELECT * FROM Persons WHERE id in (" + userId + ")", function(err, row) {
    if (err) {
      callback(err, {});
    } else {
      callback(null, row);
    }
  });

}

//getSingleProductReOrder
exports.getSingleProductReOrder = function(productId, callback){
  
  db.all("SELECT product_id, SUM(product_id) AS nums FROM OrderList WHERE product_id=?  GROUP BY person_id", productId, function(err, rows) {
    if (err) {
      callback(err, {});
    } else {
        console.log(rows);
        callback(null, rows); 
  }});
 
}

exports.insertOrderIntoDatabase = function(productId, userid, callback){
    console.log('insertOrderIntoDatabase start');
 
  
  db.run("INSERT INTO OrderList (person_id, product_id) VALUES ( ?,?)", userid, productId, function(err, rows) {
    if (err) {
      console.log('insertOrderIntoDatabase error');
      callback(err, {});
    } else {
         console.log('insertOrderIntoDatabase middle');
	db.each("SELECT * FROM OrderList", function(err, row) {
           console.log(row.id + ": " + row.person_id +  row.product_id + row.shape_score +  row.taste_score +  row.logistic_score +  row.service_score + row.total_score +  row.comment);
        });
        callback(null, null);
	console.log('insertOrderIntoDatabase end');
  }});
 
}

exports.orderEvaluation = function(person_id, product_id, shape_score, taste_score, logistic_score, service_score, callback) {

  var total_score = (parseInt(shape_score) + parseInt(taste_score) + parseInt(logistic_score) + parseInt(service_score));
  db.run("UPDATE OrderList SET shape_score=?, taste_score=?, logistic_score=?, service_score=?, total_score=? WHERE person_id=? AND product_id=?", 
                              shape_score, taste_score, logistic_score, service_score, total_score, person_id, product_id, function(err, row) {
    if (err) {
      callback(err, {});
    } else {
      callback(null, {person_id: person_id,
                      product_id: product_id,
                      shape_score: shape_score,
                      taste_score: taste_score,
                      logistic_score: logistic_score,
                      service_score: service_score,
                      total_score: total_score
      });
    }
  });
}



