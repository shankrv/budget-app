/***** Modules *****/

/* --- Budget Module --- */
var budget = (function () { // IIFE module pattern

  // fx-constructors for Income and Expense
  var Expense = function(id, desc, value) {
    this.id = id;
    this.desc = desc;
    this.value = value;
    this.percent = -1; // non-existent initially
  };

  Expense.prototype.calPercent = function(totInc) {
    if (totInc > 0) {
      this.percent = Math.round((this.value/totInc) * 100); 
    } else {
      this.percent = -1
    }
  };

  Expense.prototype.fetPercent = function() {
    return this.percent;
  };

  var Income = function(id, desc, value) {
    this.id = id;
    this.desc = desc;
    this.value = value;
  };

  var calcTotal = function(type) {
    var sum = 0;
    data.items[type].forEach(function(current) {
      sum += current.value;
    });
    data.total[type] = sum;
  };

  /* --- DATA --- */
  var data = {
    items : {exp : [], inc : []},
    total : {exp : 0, inc : 0},
    budget : 0,
    percent : -1 // non-existent (initially)
  };

  return {
    // Add Item to the data-structure
    addItem : function(type, desc, value) {
      var item, id;

      // Generating unique ID
      if (data.items[type].length > 0) {
        id = data.items[type][data.items[type].length - 1].id + 1; // Increm. the last element's ID
      } else {
        id = 0;
      }

      // Create Inc/Exp Object
      if (type === 'inc') {
        item = new Income(id, desc, value);
      } else if (type === 'exp') {
        item = new Expense(id, desc, value);
      }

      // Push item to the DATA
      data.items[type].push(item);
      return item;
    },

    delItem : function(type, id) {
      var arr, ind;
      // map() returns a brand new array
      arr = data.items[type].map(function(current) { 
        return current.id;
      });
      // check the current index of the original id passed
      ind = arr.indexOf(id); 
      // remove element from the data using index
      data.items[type].splice(ind, 1);
    },

    calcBudget : function() {
      // sum of all inc and exp
      calcTotal('inc');
      calcTotal('exp');

      // budget = tot inc - exp
      data.budget = data.total.inc - data.total.exp;

      // cal percentage for exp
      if (data.total.inc > 0) {
        data.percent = Math.round((data.total.exp / data.total.inc) * 100); 
      } else {
        data.percent = -1;
      }
    },

    getBudget : function() {
      // return object with budget details
      return {
        budget : data.budget,
        totInc : data.total.inc,
        totExp : data.total.exp,
        percent : data.percent,
      }
    },

    calcPercent : function() {
      // calculate percent
      data.items.exp.forEach(function(current) {
        current.calPercent(data.total.inc);
      });
    },

    getPercent : function() {
      // return percentages
      var percent;
      percent = data.items.exp.map(function(current) {
        return current.fetPercent();
      });
      return percent;
    },

    // Test the data-structure
    dbLog : function() {
      console.log(data);
    }
  }

})();


/* --- UI Module --- */
var UI = (function () {
  
  var classDOM = { // for DOM class Strings
    type : '.add__type',
    desc : '.add__description',
    amnt : '.add__value',
    addb : '.add__btn',
    incL : '.income__list',
    expL : '.expenses__list',
    budget : '.budget__value',
    totInc : '.budget__income--value',
    totExp : '.budget__expenses--value',
    percent : '.budget__expenses--percentage',
    cont : '.container',
    iPer : '.item__percentage',
    date : '.budget__title--month'
  };

  var formatNum = function(num, type) {
    // Rule-1 : decimal part on Integers
    // Rule-2 : prepend +/- on inc/exp acc
    // Rule-3 : comma separating thousands
    var numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length-3, 3);
    }
    dec = numSplit[1];
    return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;
  };

  var nListforEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput : function() {
      return {
        type : document.querySelector(classDOM.type).value, // inc || exp
        desc : document.querySelector(classDOM.desc).value,
        amnt : parseFloat(document.querySelector(classDOM.amnt).value)
      }
    },

    addToList : function(item, type) {
      var html, elem;
      // a. Create HTML strings
      if (type === 'inc') {
        elem = classDOM.incL;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div>';
      } else if (type === 'exp') {
        elem = classDOM.expL;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      // b. Update with act. values
      html = html.replace('%id%', item.id);
      html = html.replace('%desc%', item.desc);
      html = html.replace('%value%', formatNum(item.value, type));
      // c. Insert HTML to DOM
      document.querySelector(elem).insertAdjacentHTML('beforeend', html);
    },

    delFrList : function(itemID) {
      var elem;
      // fetch the element to delete
      elem = document.getElementById(itemID);

      // delete the elemeent from UI using removeChild()
      elem.parentNode.removeChild(elem);
    },

    clrFields : function() {
      var fields, arrFld;
      // Clear fields and focus
      fields = document.querySelectorAll(classDOM.desc + ', ' + classDOM.amnt); // returns a list
      arrFld = Array.prototype.slice.call(fields); // slice() creates a shallow copy of the array
      arrFld.forEach(function(current, index, array) { // forEach loop with callback-fx
        current.value = ''; // clear
      });
      document.querySelector(classDOM.desc).focus(); // focus
    },

    disBudget : function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';
      document.querySelector(classDOM.budget).textContent = formatNum(obj.budget, type);
      document.querySelector(classDOM.totInc).textContent = formatNum(obj.totInc, 'inc');
      document.querySelector(classDOM.totExp).textContent = formatNum(obj.totExp, 'exp');
      if (obj.percent > 0) {
        document.querySelector(classDOM.percent).textContent = obj.percent + '%';  
      } else {
        document.querySelector(classDOM.percent).textContent = '--';
      }
    },

    disperExp : function(per) {
      var fields = document.querySelectorAll(classDOM.iPer);

      nListforEach(fields, function(cur, ind) {
        if (per[ind] > 0) {
          cur.textContent = per[ind] + '%'; 
        } else {
          cur.textContent = '--';
        }
      });
    },

    dispMonth : function() {
      var now, year, month, months;
      now = new Date(); // instance of Date
      year = now.getFullYear();
      month = now.getMonth();
      months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      document.querySelector(classDOM.date).textContent = months[month] + '-' + year;
    },

    chngeType : function() {
      var fields = document.querySelectorAll(classDOM.type + ', ' + classDOM.desc + ', ' + classDOM.amnt);
      nListforEach(fields, function(cur) {
        cur.classList.toggle('red-focus');
      });
      document.querySelector(classDOM.addb).classList.toggle('red');
    },
    
    getDOMStr : function() {
      return classDOM;
    }
  }

})();


/* --- Controller Module --- */
var control = (function (budgetCtrl, UICtrl) { // args for modular interactivity
  
  var eventL = function() {
    var DOMStr = UICtrl.getDOMStr();

    // 1. Add EventListeners (private to this module, won't be invoked as an IIFE)
    /* - click event - */
    document.querySelector(DOMStr.addb).addEventListener('click', addItems); // callback-fx
    /* - keypress event - */
    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) { // 13 - ENTER/RETURN key
        addItems(); // fx-call as arg. is passed
      }
    });

    // EventListener for deleting items
    document.querySelector(DOMStr.cont).addEventListener('click', delItems); // callback-fx w/o args.

    // EventListener for type-change
    document.querySelector(DOMStr.type).addEventListener('change', UICtrl.chngeType);
  };

  var updBudget = function() {
    var budget;
    // 5. Cal the budget and return
    budgetCtrl.calcBudget();
    budget = budgetCtrl.getBudget();

    // 6. Upd the budget in the UI
    UICtrl.disBudget(budget);
  };

  var updPercent = function() {
    // Cal the percentage
    budgetCtrl.calcPercent();

    // Get the percentage
    var per = budgetCtrl.getPercent();
    
    // Upd the percentage on UI
    UICtrl.disperExp(per);
  };

  var addItems = function() {
    // 2. Get Input Data
    var input = UICtrl.getInput();
    
    if (input.desc !== '' && !isNaN(input.amnt) && input.amnt > 0) {
      // 3. Add data in budget
      var item = budgetCtrl.addItem(input.type, input.desc, input.amnt);

      // 4. Upd the data in UI
      UICtrl.addToList(item, input.type);
      UICtrl.clrFields();

      // 5. Cal and Upd budget
      updBudget(); 

      // 6. Cal and  Upd percent
      updPercent();
    }
  };

  var delItems = function(event) { // args is present coz its optional.
    var itemID, splitID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      id = parseInt(splitID[1]);

      // delete item from data
      budgetCtrl.delItem(type, id);

      // delete item from UI
      UICtrl.delFrList(itemID);

      // update the budget on UI
      updBudget();

      // update the percent on UI
      updPercent();
    }
  };

  return {
    // init-fx as return object for accessibility outside the module.
    init : function() {
      console.log('Initializing !');
      UICtrl.dispMonth();
      UICtrl.disBudget({budget : 0, totInc : 0, totExp : 0, percent : -1});
      eventL();
      console.log('App Started !');
    }
  }
  
})(budget, UI); // passing modules as params for interactivity while invoking

control.init();