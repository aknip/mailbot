/**
 * Adds a custom menu to the active spreadsheet, containing a single menu item
 * for invoking the readRows() function
 * The onOpen() function, when defined, is automatically invoked whenever the
 * spreadsheet is opened.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */
 
function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "test",
    functionName : "test"
  },
  {
    name : "test GET",
    functionName : "testGET"
  },
  {
    name : "test POST",
    functionName : "testPOST"
  }];
  sheet.addMenu("MailBot Scripts", entries);
  
  // stays for 3 secs:
  sheet.toast("Scripts geladen.","",3);
};


function onInstall() {

};