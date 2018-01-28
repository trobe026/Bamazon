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
    head: ['ID','DEPARTMENT NAME','OVERHEAD','TOTAL SALES','TOTAL PROFITS']
  , colWidths: [5, 20, 14, 15, 15]
});

var department;
var overhead;

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
        listDepts();
        break;

        case 'Create New Department':
        inquirer.prompt([
          {
            type: "input",
            message: "Enter new department name:",
            name: "department"
          },
          {
            type: "input",
            message: "Enter department's total overhead costs:",
            name: "overhead"
          }
        ])
        .then(function(res) {
          department = res.department;
          overhead = res.overhead;
          createDept();
        });
        break;

        case 'Remove Department':
        inquirer.prompt([
          {
            type: "input",
            message: "Enter department to be deleted:",
            name: "department"
          },
          {
            type: "confirm",
            message: "This will permanently remove all records of this department, are you sure?",
            name: "confirm"
          }
        ])
        .then(function(res) {
          if (res.confirm) {
            department = res.department;
            removeDept();
          } else {
            console.log("cancelled operation.")
            doNext();
          }
        })
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

function listDepts() {
  var query = connection.query("SELECT d.department_id, d.department_name, over_head_costs, SUM(product_sales) AS 'total_sales', (SUM(product_sales) - over_head_costs) AS 'total_profits' FROM products AS p RIGHT JOIN departments AS d ON p.department_name = d.department_name GROUP BY d.department_name ORDER BY total_sales DESC;",
  function(err, res) {
    for (var i = 0;i < res.length; i++) {
      if (res[i].total_sales === null) {
        res[i].total_sales = 0;
        res[i].total_profits = 0;
      }
      table.push(
        [res[i].department_id, res[i].department_name, res[i].over_head_costs,"$" + res[i].total_sales,"$" + res[i].total_profits]
      );
    }
    console.log(table.toString());
    table.length = 0;
    doNext();
  });
}


function createDept() {
  var query = connection.query("INSERT INTO departments SET ?",
{
  department_name: department,
  over_head_costs: overhead
},
function(err, res) {
  console.log(res.affectedRows + " department was successfully added!");
  listDepts();
});
}

function removeDept() {
  var query = connection.query("DELETE FROM departments WHERE department_name = ?", [department], function(err, res) {
    if (res.affectedRows < 1) {
      console.log("\n\nEntry does not exist, please check your department name and try again.");
      manageDept();
    } else {
      console.log(res.affectedRows + " department deleted!");
      listDepts();
    }
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
      manageDept();
    } else if (resp.nextAction === 'Exit Program') {
      runProg = false;
      manageDept();
    }
  });
}
