var inquirer = require("inquirer");
var mysql = require("mysql");

// Create the connection
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "iruka598",
  database: "bamazonDB"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  startProgram();
});

function showItems() {
  console.log("Selecting all products...\n");
  var itemsString;
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    
    for (var i = 0; i < res.length; i++) {
        console.log(res[i].product_name +
        " || " +
        res[i].department_name +
        " || Price:" +
        res[i].price +
        " || Stock:" +
        res[i].stock_quantity + "\n");
    }
  });
}

function buyItems() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    var itemArray = res;
    var itemNameArray = [];
    for (var i = 0; i < itemArray.length; i++) {
      itemNameArray[i] = itemArray[i].product_name;
    }
    inquirer
      .prompt([
        {
          type: "list",
          message: "What do you want to buy?",
          choices: itemNameArray,
          name: "itemChoice"
        },
        {
          type: "input",
          message: "How many?",
          name: "purchaseQuantity"
        }
      ])
      .then(function(inquirerResponse) {
        var selectedItem = inquirerResponse.itemChoice;
        console.log("You picked: " + selectedItem);
        var quantity = inquirerResponse.purchaseQuantity;
        processTransaction(quantity, selectedItem);
      });
  });
}

function processTransaction(quantity, itemName) {
  connection.query(
    "SELECT * FROM products WHERE product_name = '" + itemName + "'",
    function(err, res) {
      if (err) throw err;
      if (res[0].stock_quantity > quantity) {
        var newStockQ = res[0].stock_quantity - quantity;
        var query = connection.query(
          "UPDATE products SET ? WHERE ?",
          [
            {
              stock_quantity: newStockQ
            },
            {
              product_name: itemName
            }
          ],
          function(err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " products updated!\n");
            console.log("Enough items in stock! Purchase Made!");
            startProgram();
          }
        );
      } else {
        console.log(
          "Not enough stock for the order! Returning to main menu..."
        );
        startProgram();
      }
    }
  );
}

function startProgram() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What do you want to do?",
        choices: ["SHOW ITEMS", "BUY ITEMS", "DONE"],
        name: "choice"
      }
    ])
    .then(function(inquirerResponse) {
      console.log(inquirerResponse.choice);
      if (inquirerResponse.choice == "SHOW ITEMS") {
        showItems();
        startProgram();
      } else if (inquirerResponse.choice == "BUY ITEMS") {
        buyItems();
      } else if(inquirerResponse.choice == "DONE") {
        console.log("All done!");
        connection.end();
      }
      
    });
    
}
