var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "Ch3lsea@25",
  database: "bamazonDB"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();

//   connection.end();
});

function start() {
    console.log('These are all the products available');
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      console.log(res);
        inquirer.prompt([
            {
                name: "chosen",
                type: "input",
                message: "What is the ID of the item you would like to purchase?"
            },
            {
                name: "units",
                type: "input",
                message: "How many would you like?"
            }
            ])
            .then(function(answer) {
                console.log("\nYour order has been placed!\n\nChecking stock now\n");

                var chosenID = answer.chosen;
                var chosenNumUnits = answer.units;

                connection.query(
                    "SELECT * FROM products WHERE ?",
                    [
                        {
                            item_id: chosenID
                        }
                    ],
                    function(err, res) {
                        if (err) throw err;
    
                        //This variable stores the current stock quantity of the Chosen product
                        var currentStock = res[0].stock_quantity;
    
                        if (chosenNumUnits > currentStock){
                            //If BAMAZON doesn't have enough stock
                            console.log("Not Enough Supply, Unfortunately Your Order Has Been Cancelled");
                            //Calling the continue
                            continuePurchase();
                        } else {
                            // If BAMAZON does have enough of the product, fulfill the customer's order.
                            console.log("Your Item Is On Its Way!!!!!!!!!!!!!!!!");
    
                            //set the total cost and information of the product selected
                            var id = res[0].item_id;
                            var productName = res[0].product_name;
                            var departmentName = res[0].department_name;
                            var price = res[0].price;
                            var originalStock = res[0].stock_quantity;
                            var totalCost = parseFloat(price * chosenNumUnits);
    
                            //Updating the SQL database to reflect the remaining quantity.
                            var chosenProductStock = currentStock - chosenNumUnits;
                            connection.query(
                                "UPDATE products SET ? WHERE ?",
                                [
                                    {
                                        stock_quantity: chosenProductStock
                                    },
                                    {
                                        item_id: chosenID
                                    }
                                ],
                                function(err, res) {
                                    //UPDATE SUCCESS!
                                    console.log("Our product stock quantity of " + originalStock + " has been updated to " + chosenProductStock + ".\n");
    
                                    //Once the update goes through, show the customer the total cost of their purchase.
                                    console.log(	"=====================================================================================" +
                                                    "\nItem number:\t\t\t" + id +
                                                    "\nProduct Name:\t\t\t" + productName +
                                                    "\nProduct Category:\t\t" + departmentName +
                                                    "\nPrice Per Unit:\t\t\t" + price +
                                                    "\nUnits ordered:\t\t\t" + chosenNumUnits +
                                                    "\n-------------------------------------------------" +
                                                    "\nYOUR TOTAL COST IS:\t\t$" + totalCost +
                                                    "\n=====================================================================================\n\n");
    
                                    //Calling the continue
                                    continuePurchase();
                                }
                            );
                        }
                    });
            });
    });
}

function continuePurchase() {
	inquirer
	.prompt(
		{
			name: "continue",
			type: "confirm",
			message: "Do you have any other purchases?",
		}
	)
	.then(function(answer) {
		if(answer.continue === true) {
			start();
		} else {
			console.log(	"Thanks for shopping");
			connection.end();
		}
	});
}

