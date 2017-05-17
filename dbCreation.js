var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('shulewangDatabase.db');
 
db.serialize(function() {
	initalize();
	
  db.run("CREATE TABLE Persons(" +
         "id        int NOT NULL PRIMARY KEY," +
         "signum    varchar(255) NOT NULL," +
         "name      varchar(255) NOT NULL," +
         "password  varchar(255)," +
         "tel       varchar(25)," + 
         "address   varchar(255)," + 
         "city      varchar(255), " + 
         "picAddr   varchar(255))");
  db.run("CREATE TABLE Products(" + 
         "id          int NOT NULL PRIMARY KEY," + 
         "type        varchar(255)," + 
         "name        varchar(255) NOT NULL," + 
         "price       float," + 
         "description varchar(255)," +
         "picAddr     varchar(255))");
  db.run("CREATE TABLE Relationship(" + 
         "id         int NOT NULL PRIMARY KEY," + 
         "person_id  int, " + 
         "friends_id int)");
  db.run("CREATE TABLE OrderList(" + 
         "id             INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," + 
         "person_id      int," + 
         "product_id     int," + 
         "shape_score    int, " + 
         "taste_score    int, " + 
         "logistic_score int, " + 
         "service_score  int, " + 
         "total_score    int, " +
         "comment        varchar(255))");
  
  db.run("INSERT INTO Persons(id,signum,name,tel,picAddr) VALUES (?,?,?,?,?)", 001, "ewzabdm", "Smith Li",       "13585121111", "ewzabdm.jpg");
  db.run("INSERT INTO Persons(id,signum,name,tel,picAddr) VALUES (?,?,?,?,?)", 002, "eacefhk", "Wei Liu",        "13585122222", "eacefhk.jpg");
  db.run("INSERT INTO Persons(id,signum,name,tel,picAddr) VALUES (?,?,?,?,?)", 003, "eguanwu", "Guanzhi Wu",     "13585123333", "eguanwu.jpg");
  db.run("INSERT INTO Persons(id,signum,name,tel,picAddr) VALUES (?,?,?,?,?)", 004, "ehuajig", "Andy Jiang",     "13585124444", "ehuajig.jpg");
  db.run("INSERT INTO Persons(id,signum,name,tel,picAddr) VALUES (?,?,?,?,?)", 005, "eeijjmq", "Leo Liu",        "13585125555", "eeijjmq.jpg");
  db.run("INSERT INTO Persons(id,signum,name,tel,picAddr) VALUES (?,?,?,?,?)", 006, "ezaocen", "Changegen Zhao", "13585126666", "ezaocen.jpg");
 
 
  db.each("SELECT rowid AS id, signum, name, tel FROM Persons", function(err, row) {
      console.log(row.id + ": " + row.signum + " " + row.name + " " + row.tel);
  });

  db.get("SELECT * FROM Persons WHERE signum=? LIMIT 1", 'ehuajig', function(err, row) {
    console.log('Query ehuajig from Persons');
    if (err) {
      console.log(err);
    } else {
      console.log(row);
    }
  });
  
  db.run("INSERT INTO Products(id,type,name,price,picAddr,description) VALUES (?,?,?,?,?,?)",001, "Apple" , "Hong Fu Shi"     , 2.5 , "apple.png" , "Delicious!");
  db.run("INSERT INTO Products(id,type,name,price,picAddr,description) VALUES (?,?,?,?,?,?)",002, "Apple" , "Huang Yuan Shuai", 2.0 , "apple_goden.png" , "Awesome!!!");
  db.run("INSERT INTO Products(id,type,name,price,picAddr,description) VALUES (?,?,?,?,?,?)",003, "Banana", "Qian Ceng Jiao"  , 10.0, "banana.png", "Yummy!");
  db.run("INSERT INTO Products(id,type,name,price,picAddr,description) VALUES (?,?,?,?,?,?)",004, "Grape" , "Ju Feng"         , 20.0, "grape.png" , "Oh my God! It tastes so good.");
  
  db.each("SELECT * FROM Products", function(err, row) {
      console.log(row.id + ": " + row.name + " " + row.price + row.description);
  });
  
  db.run("INSERT INTO Relationship VALUES (001,001,003)"); // Smith -> Guangzhi
  db.run("INSERT INTO Relationship VALUES (002,001,004)");
  db.run("INSERT INTO Relationship VALUES (003,001,005)");
  db.run("INSERT INTO Relationship VALUES (004,002,006)");
  db.run("INSERT INTO Relationship VALUES (005,002,004)");
  db.run("INSERT INTO Relationship VALUES (006,002,005)");  
  db.run("INSERT INTO Relationship VALUES (007,003,005)");
  db.run("INSERT INTO Relationship VALUES (008,004,003)"); // Andy -> Guangzhi
//db.run("INSERT INTO Relationship",008,003,001);
//db.run("INSERT INTO Relationship",009,004,002);
//
//db.run("INSERT INTO Relationship",010,004,006);
//db.run("INSERT INTO Relationship",011,004,001);
//db.run("INSERT INTO Relationship",012,005,003);
  
/*db.each("SELECT rowid AS id, LastName,FirstName,wholeName FROM Friends", function(err, row) {
      console.log(row.id + ": " + row.LastName + " " + row.FirstName + " has friends " + row.wholeName);
  });*/
  
  db.run("INSERT INTO OrderList (person_id,product_id,shape_score,taste_score,logistic_score,service_score,total_score,comment) VALUES (003,001,5,5,5,5,20,'excellent')"); // Guangzhi buys 001 hong fu shi
  db.run("INSERT INTO OrderList (person_id,product_id,shape_score,taste_score,logistic_score,service_score,total_score,comment) VALUES (004,001,1,1,1,1,4,'garbage')"); // Andy buys 001 hong fu shi
  db.run("INSERT INTO OrderList (person_id,product_id,shape_score,taste_score,logistic_score,service_score,total_score,comment) VALUES (005,001,3,3,3,3,12,'so so')"); // Leo buys 001 hong fu shi
  db.run("INSERT INTO OrderList (person_id,product_id,shape_score,taste_score,logistic_score,service_score,total_score,comment) VALUES (002,002,3,3,3,3,12,'so so')"); // Wei buys 002 huang yuan shuai
  db.run("INSERT INTO OrderList (person_id,product_id,shape_score,taste_score,logistic_score,service_score,total_score,comment) VALUES (003,001,5,5,5,5,20,'excellent')"); // Guangzhi buys 001 hong fu shi
  db.run("INSERT INTO OrderList (person_id,product_id,shape_score,taste_score,logistic_score,service_score,total_score,comment) VALUES (003,001,5,5,5,5,20,'excellent')"); // Guangzhi buys 001 hong fu shi
  db.run("INSERT INTO OrderList (person_id,product_id,shape_score,taste_score,logistic_score,service_score,total_score,comment) VALUES (003,003,5,5,5,5,20,'excellent')"); // Guangzhi buys 003 banana
  
  db.each("SELECT * FROM OrderList", function(err, row) {
      console.log(row.id + ": " + row.person_id +  row.product_id + row.shape_score +  row.taste_score +  row.logistic_score +  row.service_score + row.total_score +  row.comment);
  });
  
});

db.close();

function initalize(){
  db.serialize(function() {
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Persons'", function(err, row) {
      if (!err & row) {
      }
    });	
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Relationship'", function(err, row) {
      if (!err & row) {
      }
    });	
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='OrderList'", function(err, row) {
      if (!err & row) {
      }
    });	
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Products'", function(err, row) {
      if (!err & row) {
      }
    });	
  });

	db.run("DROP TABLE Persons");
	db.run("DROP TABLE Relationship");
	db.run("DROP TABLE OrderList");
	db.run("DROP TABLE Products");
}
