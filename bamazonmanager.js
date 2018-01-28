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

var fullTable = new Table({
    head: ['ID', 'PRODUCT NAME','DEPARTMENT','PRICE','QUANTITY']
  , colWidths: [5, 20, 17, 7, 10]
});

var lowTable = new Table({
    head: ['ID', 'PRODUCT NAME','DEPARTMENT','PRICE','QUANTITY']
  , colWidths: [5, 20, 17, 7, 10]
});

var productName;
var productDept;
var price;
var qty;

var runProg = true;
var connected = false;

var manageInv = function() {
  if (!runProg) {
    console.log("See you next time!");
    process.exit();
  } else {
    inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "\nBamazon Main Menu:\n",
      choices: [
        'Show Inventory.',
        new inquirer.Separator(),
        'Show Low Inventory.',
        new inquirer.Separator(),
        'Change Inventory.',
        new inquirer.Separator(),
        'Add New Product',
        new inquirer.Separator(),
        'Remove a Product.',
        new inquirer.Separator(),
        'Exit Program\n'
      ]
    }
    ])
    .then(function(response) {

      switch(response.choice) {
        case 'Show Inventory.':
            listProductsB();
            break;

        case 'Show Low Inventory.':
            listProductsLow();
            break;

        case 'Change Inventory.':
          inquirer.prompt([
            {
              type: "input",
              message: "Select product:",
              name: "product"
            },
            {
              type: "input",
              message: "Enter new quantity",
              name: "qty"
            }
          ])
          .then(function(resp) {
            productName = resp.product;
            qty = resp.qty;
            modQty();
          });
          break;

        case 'Add New Product':
            inquirer.prompt([
              {
                type: "input",
                message: "Enter Product Name:",
                name: "product"
              },
              {
                type: "input",
                message: "Enter Department:",
                name: "dept"
              },
              {
                type: "input",
                message: "What will this product cost?",
                name: "price"
              },
              {
                type: "input",
                message: "How many in stock?",
                name: "qty"
              }
            ])
            .then(function(resp) {
             productName = resp.product;
             productDept = resp.dept;
             price = resp.price;
             qty = resp.qty;
             addProduct();
            });
            break;

          case 'Remove a Product.':
            inquirer.prompt([
              {
                type: "input",
                message: "Which item would you like to remove?",
                name: "item"
              },
              {
                type: "confirm",
                message: "This will permanently remove all records of this product, are you sure?",
                name: "confirm"
              }
            ])
            .then(function(resp) {
              if (resp.confirm) {
                productName = resp.item;
                deleteProduct();
              } else {
                doNext();
              }

            });
              break;

          case 'Exit Program\n':
            runProg = false;
            manageInv();
            break;
      }
    });
  }
};
manageInv();

function listProductsA() {
  var query = connection.query("SELECT * FROM products",
    function(err,res) {
      for (var i = 0; i < res.length; i++) {
          fullTable.push(
              [res[i].item_id, res[i].product_name, res[i].department_name,"$" + res[i].price, res[i].stock_quantity]
          );
      }
      console.log(fullTable.toString());
      fullTable.length = 0;
    });
}

function listProductsB() {
  var query = connection.query("SELECT * FROM products",
    function(err,res) {
      for (var i = 0; i < res.length; i++) {
          fullTable.push(
              [res[i].item_id, res[i].product_name, res[i].department_name,"$" + res[i].price, res[i].stock_quantity]
          );
      }
      console.log(fullTable.toString());
      fullTable.length = 0;
      doNext();
    });
}

function listProductsLow() {
  var query = connection.query("SELECT * FROM products WHERE stock_quantity < 5",
    function(err,res) {
      for (var i = 0; i < res.length; i++) {
          lowTable.push(
              [res[i].item_id, res[i].product_name, res[i].department_name,"$" + res[i].price, res[i].stock_quantity]
          );
      }
      console.log(lowTable.toString());
      lowTable.length = 0;
      doNext();
    });
}

function modQty() {
  connectServer();
  var query = connection.query("UPDATE products SET stock_quantity = ? WHERE product_name = ?", [qty, productName],
  function(err, res) {
    if (res.affectedRows === 0) {
      console.log("ERROR - PRODUCT NAME NOT FOUND, PLEASE TRY AGAIN.")
      manageInv();
    } else {
      console.log(res.affectedRows + " product quantity updated!");
      listProductsB();
    }
  });
}

function addProduct() {
  connectServer();
   var query = connection.query("INSERT INTO products SET ?",
 {
   product_name: productName,
   department_name: productDept,
   price: price,
   stock_quantity: qty
 },
 function (err, res) {
   listProductsB();
   console.log(res.affectedRows + " product was successfully added!");
 });
}

function deleteProduct() {
  connectServer();
  var query = connection.query("DELETE FROM products WHERE product_name = ?", [productName],
  function(err, res) {
    console.log("\nDeleted " + res.affectedRows + " product");
    listProductsB();
});
}

function doNext() {
  inquirer.prompt([
    {
      type: "list",
      name: "nextAction",
      message: "\n\nWhat would you like to do now?\n",
      choices: [
        'Back to Main Menu',
        'Exit Program'
      ]
    }
  ])
  .then(function(resp) {
    if (resp.nextAction === 'Back to Main Menu') {
      manageInv();
    } else if (resp.nextAction === 'Exit Program') {
      runProg = false;
      manageInv();
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
