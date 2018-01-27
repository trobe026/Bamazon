var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require('cli-table2');

var connection = mysql.createConnection({
  host: "localhost",
  port: 8889,
  // Your username
  user: "root",
  // Your password
  password: "root",
  database: "bamazonDB"
});

// these variables are to store user choices throughout inquirer prompts
var productId;
var quantity;
var Quantity;
var total;

// this variables store booleans which control which functions run, preventing errors if functions are run twice.
var runProg = true;
var connected = false;

var table = new Table({
    head: ['ID', 'PRODUCT NAME','DEPARTMENT','PRICE','QUANTITY','TOTAL SALES']
  , colWidths: [5, 20, 17, 7, 10, 14]
});

var purchaseTable = new Table({
    head: ['ID', 'PRODUCT NAME','QUANTITY','TOTAL']
  , colWidths: [5, 20, 10, 20]
});

listProducts();


function openStore() {
  if (!runProg) {
    console.log("Thank you for your patronage.");
    process.exit();
  } else {
    inquirer.prompt([
      {
        type: "input",
        message: "\nPlease enter the product ID number:\n",
        name: "product",
        validate: function(input) {
          var done = this.async();
          var numbers = /^[0-9]+$/;
          setTimeout(function() {
            if (!input.match(numbers)) {
              console.log(" is not a valid entry");
              done("Please enter a number.");
              return;
            }
            done(null, true);
          }, 0);
        }
      },
      {
        type:"input",
        message:"How many units would you like?",
        name: "units",
        validate: function(input) {
          var done = this.async();
          var numbers = /^[0-9]+$/;
          setTimeout(function() {
            if (!input.match(numbers)) {
              console.log(" is not a valid entry");
              done("Please enter a number.");
              return;
            }
            done(null, true);
          }, 0);
        }
      }
    ])
    .then(function(res) {
      productId = res.product;
      quantity = parseInt(res.units);
      checkPurchase();
    })
  }
}

function listProducts() {
  var query = connection.query("SELECT * FROM products",
    function(err,res) {
      for (var i = 0; i < res.length; i++) {
        if (res[i].product_sales === null) {
          res[i].product_sales = 0;
        }
          table.push(
              [res[i].item_id, res[i].product_name, res[i].department_name,"$" + res[i].price, res[i].stock_quantity,"$" + res[i].product_sales]
          );
        }

      console.log(table.toString());
      table.length = 0;
      openStore();
    });

}

function checkPurchase() {
  connectServer();
   var query = connection.query("SELECT * FROM products WHERE item_id = ?", [productId],
 function (err, res) {
   if (err) throw err;
   if (res[0].stock_quantity < quantity) {
     console.log("Insufficient quantity! Please verify stock.");
     openStore();
   } else {
     total = res[0].product_sales + res[0].price * quantity;
     Quantity = res[0].stock_quantity - quantity;
     purchase();
    }
 });
}

function purchase() {
  connectServer();
  var query = connection.query("UPDATE products SET stock_quantity = ?, product_sales = ? WHERE item_id = ?", [Quantity, total, productId],
  function (err, res) {
     if (err) throw err;
     if (quantity > 1) {
       console.log(quantity + " items purchased!\n");
       receipt();
     } else {
       console.log(quantity + " item purchased!\n");
       receipt();
     }
  });
}
function receipt() {
  var query = connection.query("SELECT * FROM products WHERE item_id = ?", [productId],
  function(err, res) {
    total = res[0].price * quantity;
    purchaseTable.push(
      [res[0].item_id, res[0].product_name, quantity,"$" + total + " (" + "$" + res[0].price + " * " + quantity + ")"]
    );
    console.log("Customer Receipt:");
    console.log(purchaseTable.toString());
    purchaseTable.length = 0;
    doNext();
  });
}

function doNext() {
  inquirer.prompt([
    {
      type: "list",
      name: "nextAction",
      message: "\n\nWhat would you like to do now?\n",
      choices: [
        'Buy Something Else',
        'Exit'
      ]
    }
  ])
  .then(function(resp) {
    if (resp.nextAction === 'Buy Something Else') {
      listProducts();
    } else if (resp.nextAction === 'Exit') {
      runProg = false;
      openStore();
    }
  });
}

function connectServer() {
  if (connected = false) {
    connection.connect(function(err) {
      if (err) throw err;
      console.log("\nconnected as id: " + connection.threadId);
      connected = true;
    })
  }
}
