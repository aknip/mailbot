//
// TESTS
//


// run with default context - defined in file 'context.gs'
function run_unit_tests() {  
  context().log(context(), 'Header', 'Start Logging with Context Logger')
  unit_tests(context());
}

// run with individual context
function run_unit_tests_individual_context() {  
  var myContext = {
    appMode: 'online-test',
    spreadsheetID: 'myID',
    log: function(context, header, message) {
      // Logger.log('MYLOG:')
      // Logger.log(context)
      // log to console
      console.log(message);
      Logger.log(message)
      
      // log to spreadsheet
      var spreadsheet = SpreadsheetApp.openById(context.spreadsheetID); //var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      var log_sheet = spreadsheet.getSheetByName("log");
      var log_sheet_data = log_sheet.getDataRange();
      var log_sheet_rows = log_sheet_data.getNumRows();
      var now = new Date();
      currenttime = Utilities.formatDate(now, 'Europe/Berlin', 'yyyy-MM-dd HH:mm:ss');
      log_sheet.getRange(log_sheet_rows+1, 1).setValue(currenttime)
      log_sheet.getRange(log_sheet_rows+1, 2).setValue(header)
      log_sheet.getRange(log_sheet_rows+1, 3).setValue(message)
      
      
      // log to HTML / DOM when developing offline / in the browser
        /*
      var para = document.getElementById('log'); 
      var logtext = para.innerHTML; 
      logtext = logtext + "<br><br><b>" + header + '</b><br>';
      logtext = logtext + log_syntaxHighlight(message) //JSON.stringify(message, 0, 2);
      para.innerHTML = logtext;
        */
    }
  }
  unit_tests(myContext)
}


// the tests

// Test with email from line 8
// var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
// var log_sheet = spreadsheet.getSheetByName("log");
// var mail = JSON.parse(log_sheet.getRange(8, 3).getValue());  
// var fullMailBody = mail.body;

function unit_tests(context) {  
 
  var test = tyrionTestRunner(context);
  test.log('start testing...');
  
  test.check('Test 1: Mailparser D&O offer, 4 data points', function () {
    var ID = 4711;
    var mail = {'subject':'Test 1','from':'user1 <user1@abc.com>','body':'I want an D & O Offer\r\nName: ABC, Umsatz: 2500000','type':'get'};
    var mail_data = parseMailBody(context, mail.body, ID); 
    var expected_data = {"intent":{"action":"Create offer","parameter":"D&O"},"data":[{"label":"Name","value":"ABC"},{"label":"Turnover","value":"2500000"}]};
    test.expect.deeplyEqual(mail_data, expected_data);
  });
  
  test.check('Test 2: Mailparser Cyber offer, 7 data points', function () {
    var ID = 4712;
    var mail = {'subject':'WG: WG: Test','from':'NN <nn@abc.com>','body':'ich hätte gern ein angebot für cyber\r\nwhat industry group:IT "hier text dazwischen" Test Label:test, employees number:10.000 / limit:500,00,Außenumsatz=1.000.000\ntest:test / Volume  :  2.500.000.000\r\nzeile 2\r\n\r\nVon: abc@abc.com [mailto:abc@abc.com]\r\nGesendet: Montag, 7. Januar 2019 20:47\r\nAn: N.N.\r\nBetreff: Aw: WG: Test\r\n\r\nReply von web.de\r\nZeile 2\r\n\r\nGesendet: Montag, 07. Januar 2019 um 20:45 Uhr\r\nVon: \'N.N.\' <nn@abc.com<mailto:nn@abc.com>>\r\nAn: \'abc@abc.com<mailto:abc@abc.com>\' <abc@abc.com<mailto:abc@abc.com>>\r\nBetreff: WG: Test\r\n\r\n\r\nVon: N.N. [mailto:abc@abc.com]\r\nGesendet: Montag, 7. Januar 2019 20:43\r\nAn: N.N.\r\nBetreff: Re: Test\r\n\r\nReply 3 (von Gmail)\r\nZeile 2\r\n\r\nAm Mo., 7. Jan. 2019 um 20:41 Uhr schrieb NN <nn@abc.com<mailto:nn@abc.com>>:\r\nBody 1\r\nBody 2\r\n\r\nVon: N.N.\r\nGesendet: Montag, 7. Januar 2019 20:42\r\nAn: N.N.\r\nBetreff: AW: Test\r\n\r\nReply 1\r\nZeile 2\r\n\r\nVon: N.N.\r\nGesendet: Montag, 7. Januar 2019 20:42\r\nAn: N.N.\r\nBetreff: Test\r\n\r\nBody 1\r\nBody 2\r\n','type':'get'};
    var mail_data = parseMailBody(context, mail.body, ID); 
    var expected_data = {"intent":{"action":"Create offer","parameter":"Cyber"},"data":[{"label":"what industry group","value":"IT"},{"label":"Test Label","value":"test"},{"label":"employees number","value":"10000"},{"label":"limit","value":"500,00"},{"label":"Turnover","value":"1000000"},{"label":"test","value":"test"},{"label":"Volume","value":"2500000000"}]};
    //test.log(JSON.stringify(mail_data)) 
    test.expect.deeplyEqual(mail_data, expected_data);
  });
  
  
  test.end();

}

function unit_tests_VORLAGE(context) {  
 
  var test = tyrionTestRunner(context);
  
  test.log('start testing');
  
  test.check('test 1', function () {
    test.expect.truthy(true);
  });
  
  test.check('test 2', function () {
    test.expect.falsy(false);
  });
  
  test.check('test 3', function () {
    test.expect.identical(3, 3);
  });
  
  test.check('test 4', function () {
    test.expect(123 === 123);
  });
  
  test.end();

}


function tyrionTestRunner(context) {
  
  // https://github.com/alcidesqueiroz/tyrion
  
  var tyrion = {
    SILENT: false
  };
  
  // Repeats a string n times
  var repeat = function repeat(str, n) {
    return Array(n).join(str);
  };
  
  // Repeats an indent (of four spaces) n times
  var indent = function indent(n) {
    return repeat('    ', n);
  };
  
  // Indents a string with multiple lines
  var indentLines = function indentLines(str, n) {
    return indent(n) + str.replace(/\n/g, "\n" + indent(n));
  };
  
  // Runs every beforeEach callback in the stack
  var runEveryBeforeEach = function runEveryBeforeEach() {
    beforeEachStack.forEach(function (level) {
      return level.forEach(function (cb) {
        return cb();
      });
    });
  };
  
  // Logs a string to the console
  var log = function log(str) {  
    return !tyrion.SILENT && context.log(context, '',str);
  };
  
  // Keeps some counters used to print the summary after the execution of a test suite is completed
  var summary = { success: 0, fail: 0, disabled: 0 };
  
  // The stack of beforeEach callbacks
  var beforeEachStack = [[]];
  var indentLevel = 0;
  
  // Declares a testing group
  var group = function group(title, cb) {
    beforeEachStack.push([]);
    indentLevel++;
    log("\n" + indent(indentLevel) + "⇨ " + title);
    cb();
    indentLevel--;
    beforeEachStack.pop();
  };
  
  // Declares a test unit
  var check = function check(title, cb) {
    runEveryBeforeEach();
  
    try {
      cb();
      log(indent(indentLevel + 1) + ' OK ' + " " + title);
      summary.success++;
    } catch (e) {
      log(indent(indentLevel + 1) + ' FAIL ' + " " + title);
      log(indentLines(e.stack, indentLevel + 2));
      summary.fail++;
    }
  };
  
  // Disables a test unit
  var xcheck = function xcheck(title, cb) {
    log(indent(indentLevel + 1) + ' DISABLED ' + " " + title);
    summary.disabled++;
  };
  
  // The assertion function
  var expect = function expect(val) {
    if (val) return true;
    log('Assertion failed.')
    throw new Error();
  };
  
  // Add all matchers as properties of our assertion function
  expect.truthy = function (val) {
    if (val) return true;
    log("The value is falsy. Value: " + val)
    throw new Error();
  };
  
  expect.falsy = function (val) {
    if (!val) return true;
    log("The value is truthy. Value: " + val)
    throw new Error();
  };
  
  expect.identical = function (a, b) {
    // eslint-disable-next-line
    if (a == b) return true;
    log("The values are not identical.\nFound: " + a + "\nWanted: " + b);
    throw new Error();
  };
  
  expect.same = function (a, b) {
    if (a === b) return true;
    throw new Error("The values are not the same.\n\nFound: " + a + "\nWanted: " + b);
  };
  
  var deepEqual = function deepEqual(x,y) {
    return (x && y && typeof x === 'object' && typeof y === 'object') ?
      (Object.keys(x).length === Object.keys(y).length) &&
        Object.keys(x).reduce(function(isEqual, key) {
          return isEqual && deepEqual(x[key], y[key]);
        }, true) : (x === y);
  };
  expect.deeplyEqual = function (a, b) {
    // from https://stackoverflow.com/questions/201183/how-to-determine-equality-for-two-javascript-objects
    if (deepEqual(a, b) == true) return true;
    log("The objects are not identical.\nFound: " + JSON.stringify(a, null, 2) + "\nWanted: " + JSON.stringify(b, null, 2));
    throw new Error();
  };
  
  // expect.deeply-idential : not integrated due to external dependency: https://github.com/alcidesqueiroz/tyrion/tree/master/src/matchers
  
  expect.throws = function (fn) {
    var errorMsg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  
    var didNotThrowError = new Error('The supplied function didn\'t throw an error');
    try {
      fn();
      throw didNotThrowError;
    } catch (e) {
      if (e === didNotThrowError) throw didNotThrowError;
      if (!errorMsg || e.message === errorMsg) return true;
  
      throw new Error('The error message is different from the expected one.' + ('\n\nFound: ' + e.message + '\nWanted: ' + errorMsg));
    }
  };
  
  // Prints the test summary and finishes the process with the appropriate exit code
  var end = function end() {
    log(repeat('.', 60) + "\n");
    log('Test summary:\n');
    log("  Success: " + summary.success);
    log("  Fail: " + summary.fail);
    log("  Disabled: " + summary.disabled + "\n\n");
  
    //if (summary.fail > 0) process.exit(1);
    //process.exit(0);
  };
  
  // A dead simple (and not human-proof) implementation of the beforeAll function
  var beforeAll = function beforeAll(cb) {
    return cb();
  };
  
  // A simple and functional beforeEach implementation
  var beforeEach = function beforeEach(cb) {
    beforeEachStack[beforeEachStack.length - 1].push(cb);
  };
  
  // Exports Tyrion's 
  // public functions (API)
  return Object.freeze({ 
    expect: expect, 
    check: check, 
    xcheck: xcheck, 
    end: end, 
    group: group, 
    beforeEach: beforeEach, 
    beforeAll: beforeAll,
    log: log
  });
}
