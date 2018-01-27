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

var runProg = true;
var table = new Table({
    head: ['ID', 'DEPARTMENT NAME','OVERHEAD COSTS','PRODUCT SALES','TOTAL PROFIT']
  , colWidths: [5, 20, 14, 14, 14]
});

function listDepts() {
  var query = connection.query("SELECT department_name FROM products AS p GROUP BY   ",
  function(err, res) {
    for (var i = 0;i < res.length; i++) {
      table.push(
        [res[i].d.department_name, res[i].]
      )
    }
  })

}

function getData() {

addSales();
}

function addSales() {
  var query = connection.query("SELECT ")
listDept();
}

var manageDept = function() {
  if (!runProg) {
    console.log("See you next time!");
    process.exit();
  } else {
    inquirer.prompt([
      {
        type: "list",
        name: "choice",
        message: "\nBamazon Departments Main Menu:\n",
        choices: [
          'View Product Sales by Department',
          new inquirer.Separator(),
          'Create New Department',
          new inquirer.Separator(),
          'Remove Department',
          new inquirer.Separator(),
          'Exit Program\n'
        ]
      }
    ])
    .then(function(res) {

      switch(res.choice) {
        case 'View Product Sales by Department':
        break;

        case 'Create New Department':
        break;

        case 'Remove Department':
        break;

        case 'Exit Program\n':
        runProg = false;
        manageDept();
        break;
      }

    });
  }
}
manageDept();
