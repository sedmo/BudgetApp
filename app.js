var budgetConroller = (function () {

    var Expense = function (id, description, value) {
        this.id = id,
            this.description = description,
            this.value = value,
            this.percentage = -1
    };

    //Create a prototype for Expense that calc percentages
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    //Create a getter method for the percentages
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id,
            this.description = description,
            this.value = value
    };

    var calculateTotal = function (type) {
        var sum;

        sum = data.allItems[type].reduce((accumulator, currentValue) => accumulator + currentValue.value, 0);
        data.totals[type] = sum;
    };

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

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            //Create new ID 
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            //Create new item
            if (type === "exp") {
                newItem = new Expense(ID, des, val);

            } else if (type === "inc") {
                newItem = new Income(ID, des, val);

            }

            //push our new data structure
            data.allItems[type].push(newItem);


            //return new element

            return newItem;
        },
        deleteItem: function (type, id) {

            data.allItems[type] = data.allItems[type].filter(x => x.id !== id);

        },
        calculateBudget: function () {
            //1. calculate total income 
            calculateTotal('exp');
            //2. calculate total expenses
            calculateTotal('inc');
            //3. Calculate budget (income - expenses)
            data.budget = data.totals.inc - data.totals.exp;
            //calculate percentage of income that we spent

            //let's only calculate the percentage when we actually have some income 
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        calculatePercentages: function () {
            data.allItems.exp.forEach(x => {
                x.calcPercentage(data.totals.inc);
            });

        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },
        getPercentages: function () {
            return data.allItems.exp.map(x => x.getPercentage());
        },
        testing: function () {
            return data;
        }
    }
})();

var UIController = (function () {
    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        expensesLabel: '.budget__expenses--value',
        incomeLabel: '.budget__income--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage'
    };

    let formatNumber = function (num, type) {
        let numSplit, dec, int, sign;
        /*
        rules:
        1. + or - before num
        2. exactly 2 decimal places
        3. comma seperating thousands
        */
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];

        //Nice implementation for handling commas in a number
        function includeCommas(strNum) {
            if (int.length > 3) {
                var reversedStr = strNum.split('').reverse().join('');
                var insertedArr = [];
                var iterations = Math.ceil(reversedStr.length / 3);
                for (var i = 0; i < iterations; i++) {
                    var start = i * 3;
                    insertedArr.push(reversedStr.substr(start, 3).split('').reverse().join(''));
                }
                return insertedArr.reverse().join(',');
            } else {
                return strNum;
            }
        }
        int = includeCommas(int);
        sign = type === 'inc' ? '+' : '-';
        //if num is === 0 no need for a sign 
        if (num == 0) {
            sign = '';
        }
        return `${sign} ${int}.${dec}`;
    };


    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // "inc" => + and "exp" => -
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;

            //Create HTML string with placeholder text
            //%id% is written this way to easily identify via replace
            if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div \
                class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div \
                class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix"id="inc-%id%"> <div class="item__description">\
                %description%</div><div class="right clearfix"><div class="item__value">%value%</div>\
                <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline">\
                </i></button></div></div></div>';
            }

            // Replace placeholder text with actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //insert HTMl into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml); //newHtml will be inserted as 
            //the next child in 'element'
        },
        deleteListItem: function (selectorID) {
            let el = document.getElementById(selectorID);

            el.parentNode.removeChild(el);
        },
        clearFIelds: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);

            //Let's convert 'fields' into an array

            fieldsArr = Array.prototype.slice.call(fields);

            //Let's replace the values with an empty string
            fieldsArr.forEach(curr => curr.value = "");

            //one last thing, set the focus back to the description field
            fieldsArr[0].focus();

        },
        displayBudget: function (obj) {
            let type;
            type = obj.budget > 0 ? 'inc' : 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, type);
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, type);


            //if the percentage == -1 then display percentage to user
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function (percentages) {
            let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            fields.forEach(((current, ind) => {
                current.textContent = percentages[ind] > 0 ? `${percentages[ind]}%` : '---';
            }))
        },
        getDOMstrings: function () {
            return DOMstrings;
        }

    };
})();


//GLOBAL APP Controller
var controller = (function (budCtrl, UICtrl) {
    let setupEventListeners = function () {

        let DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

        //create event for when return is pressed 
        document.addEventListener("keypress", function (event) {
            if (event.keyCode === 13 || event.which === 13) { //KeyBoardEvent.which property is used for older browsers
                ctrlAddItem();
            }
        })

        //create event for when delete button is pressed 
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    let updateBudget = function () {
        //1. Calc the budget
        budCtrl.calculateBudget();
        //2. Return the budget
        var budget = budCtrl.getBudget();
        //3. Display budget on UI
        UICtrl.displayBudget(budget);
    };

    let updatePercentages = function () {
        //1. Calculate percentages
        budCtrl.calculatePercentages();
        //2. Read percentages from budget controller
        // returns an array of percentages
        let percentages = budCtrl.getPercentages();
        //3. Update UI with new percentages
        UICtrl.displayPercentages(percentages);


    };

    let ctrlAddItem = function () {
        let input, newItem;
        //1. Get the field input data
        input = UICtrl.getInput();

        //Let's make sure that the user inputs something in first!
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. Add item to budget controller
            newItem = budCtrl.addItem(input.type, input.description, input.value);
            //3. Add item to UI
            UICtrl.addListItem(newItem, input.type);
            //4. Clear the fields
            UICtrl.clearFIelds();
            //5. Calculate and update budget
            updateBudget();
            //6. Calculate and update percentages
            updatePercentages();
        }


    };

    let ctrlDeleteItem = function (event) {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; //this will give us the id of the element being deleted

        //continue if itemID exists
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = Number(splitID[1]);

            //1. delete item from DS
            budCtrl.deleteItem(type, ID);
            //2. delete item from UI
            UICtrl.deleteListItem(itemID);
            //3. update and show new budget
            updateBudget();
            //4. Calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log('Application has started');
            //let's initialize the UI with 0's 
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetConroller, UIController); //to prevent having to reFactor the module later on 

controller.init();