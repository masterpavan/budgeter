//==============================================================================================
//BUDGET CONTROLLER
var budgetController = (function() {

    //PRIVATE
    
    //this is the constructor for Expense objects
    var Expense = function(id, des, val) {
        this.id = id;
        this.description = des;
        this.value = val;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(data.totals.inc > 0) {
            this.percentage = Math.round(100*(this.value/totalIncome));
        } else {
            this.percentage = -1;
        }
    }
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    
    //this is the constructor for Income objects
    var Income = function(id, des, val) {
        this.id = id;
        this.description = des;
        this.value = val;
    };
       
    //this is the data structure that keeps track of all data that the app uses
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        
        totals: {
            exp: 0,
            inc: 0
        },
        
        budget: 0,
        
        percentage: -1
    };
    
    //this function is used to calculate the total value of the incomes or expenses
    var calculateTotal = function(type) {
        var sum = 0;
        
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        
        data.totals[type] = sum;
    }
    
    //PUBLIC
    return {
        //this function adds an item to the data structure, either income or expense
        addItem: function(type, des, val) {
            var newItem, ID;
            
            //Create new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            //Create Income or Expense element
            if(type === 'inc') {
                newItem = new Income(ID, des, val);
            } else if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            
            //add the element to our data structure
            data.allItems[type].push(newItem);
            
            //return the element
            return newItem;              
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        //this function simply prints out the data structure
        testing: function() {
            console.log(data);
        },
        
        //this function does all of the calculations across the screen
        calculateBudget: function() {
            
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            //calculate income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate percentage of income we spend
            if(data.totals.inc > 0) {
                data.percentage = Math.round(100 * (data.totals.exp / data.totals.inc));
            } else {
                data.percentage = -1;
            }
            
        },
        
        calculatePercentages: function() {
            
            data.allItems.exp.forEach(function(expense) {
                expense.calcPercentage(data.totals.inc);
            });
            
        },
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(expense) {
                return expense.getPercentage();
            });
            return allPerc;
        },
        
        //this function returns the important values in the data structure
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        }
    }

})();
//==============================================================================================






//==============================================================================================
//UI CONTROLLER
var UIController = (function() {
    
    //PRIVATE
    //this object stores the different DOM class names
    var DOM = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputAddBtn: '.add__btn',
        incContainer:  '.income__list',
        expContainer:  '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePerc: '.item__percentage',
        dateLabel: '.budget__title--month'
        
    }
    
    
    var formatNumber = function(num, type) {
        var numSplit, integer, decimal, sign, newInt;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.')
        integer = numSplit[0];
        newInt = '#'
        
        //num is 50000000
        //  i is 01234567
        
        if(integer.length>3){
            for(var i = integer.length-1; i >= 0; i--) {
                if((integer.length - i - 1) % 3 === 0) {
                    newInt = integer.charAt(i) + ',' + newInt;
                   
                } else {
                    newInt = integer.charAt(i) + newInt;
                }
            }
            newInt = newInt.slice(0, newInt.length-2);
        } else {
            newInt = integer;
        }
        
        decimal = numSplit[1];

        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + newInt + '.' + decimal;
    }
    
    var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    //PUBLIC
    return {
        //this function returns the user input as an object
        getInput: function() {
            return {
                type: document.querySelector(DOM.inputType).value, // will be inc or exp
                description: document.querySelector(DOM.inputDescription).value,
                value: parseFloat(document.querySelector(DOM.inputValue).value)
            }
        },  
        
        //this function gives the other modules access to the DOM class names
        getDOMstrings: function() {
            return DOM;   
        },
        
        //this function adds an item to the UI
        addListItem: function(obj, type) {
            
            var html, newhtml, element;
            //create HTML string with placeholder text
            if(type === 'inc') {
                element = DOM.incContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp') {
                element = DOM.expContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //replace placeholder text with actual data
            newhtml = html.replace('%id%', obj.id);
            newhtml = newhtml.replace('%description%', obj.description);
            newhtml = newhtml.replace('%value%', formatNumber(obj.value, type));
            
            //insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newhtml);
            
        },
        
        deleteListItem: function(selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },
        
        //this function clears the user input for the next item
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOM.inputDescription + ', ' + DOM.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            
            //put cursor focus on the description field
            fieldsArr[0].focus();
            
        },
        
        //this function updates all of the budget UI elements
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOM.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOM.incomeLabel).textContent = formatNumber(obj.totalInc, type);
            document.querySelector(DOM.expenseLabel).textContent = formatNumber(obj.totalExp, type);
            if(obj.percentage > 0) {
                document.querySelector(DOM.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOM.percentageLabel).textContent = '--';
            }
        },
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOM.expensePerc);
            
            nodeListForEach(fields, function(current, index) {
                //do this for each 
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '--';
                }
            });
            
        },
        
        displayMonth: function() {
            var now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DOM.dateLabel).textContent = months[month] + ' ' + year;
            
        },
        
        changedType: function() {
            
            var fields = document.querySelectorAll(DOM.inputType + ',' + DOM.inputDescription + ',' + DOM.inputValue)
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            })
            
            document.querySelector(DOM.inputAddBtn).classList.toggle('red');
            
        }
    
    };
    
})();
//==============================================================================================






//==============================================================================================
//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    //PRIVATE 
    //this function starts up the click and key listeners
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputAddBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
        
    }
    
    //this function calls the budget controller to do the calculations after an item addition
    //then calls the UI controller to display the changes
    var updateBudget = function() {
        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        //2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }
    
    var updatePercentages = function() {
        //1. calculate percentages
        budgetCtrl.calculatePercentages();
        
        //2. get the budget from controller
        var percentages = budgetCtrl.getPercentages();
       
        //3. update the UI with percentages
        UICtrl.displayPercentages(percentages);
        
    }
    
    //this function uses the other controllers to correctly add and display a new item
    var ctrlAddItem = function() {
        var input, newItem;
        
        //1. get the field data
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. add the item to the UI and clear fields
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();

            //4. calculate and update budget
            updateBudget();
            
            //5. calculate and update percentages
            updatePercentages();
        }
        
    }
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
        
            //1. delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            
            //2. delete item from UI
            UICtrl.deleteListItem(itemID);
            
            //3. update and display the budget
            updateBudget();
            
            //4. calculate and update percentages
            updatePercentages();
        }
        
    }
    
    //PUBLIC
    return {
        //this is the init function which starts the functionality of the app.
        init: function() {
            console.log('application has started.');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            })
            UICtrl.displayMonth();
            setupEventListeners();
        }
    }
    
})(budgetController, UIController);
//==============================================================================================

controller.init();