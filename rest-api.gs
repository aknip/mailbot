function doGet(e) {

  if(typeof e !== 'undefined')
    {
    //var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var spreadsheet = SpreadsheetApp.openById("xxx");
    var log_sheet = spreadsheet.getSheetByName("log");
    var log_sheet_data = log_sheet.getDataRange();
    var log_sheet_rows = log_sheet_data.getNumRows();
    var now = new Date();
    currenttime = Utilities.formatDate(now, 'Europe/Berlin', 'yyyy-MM-dd HH:mm:ss');
    log_sheet.getRange(log_sheet_rows+1, 1).setValue(currenttime)
    log_sheet.getRange(log_sheet_rows+1, 2).setValue('GET')
    log_sheet.getRange(log_sheet_rows+1, 3).setValue(JSON.stringify(e.parameter))
  
    return ContentService.createTextOutput(JSON.stringify(e.parameter));
    }
}

function doPost(e) {
  
  if(typeof e !== 'undefined')
    return ContentService.createTextOutput(JSON.stringify(e.parameter));
  
}

function testPOST() {
  
  var url = ScriptApp.getService().getUrl();
  
  var payload =
      {
        "name" : "labnol",
        "blog" : "ctrlq",
        "type" : "post",
      };
  
  var options =
      {
        "method"  : "POST",
        "payload" : payload,   
        "followRedirects" : true,
        "muteHttpExceptions": true
      };
  
  var result = UrlFetchApp.fetch(url, options);
  
  if (result.getResponseCode() == 200) {
    
    var params = JSON.parse(result.getContentText());
    
    Logger.log('POST Test:');
    Logger.log(params.name);
    Logger.log(params.blog);
    
  }
  
}

function testGET() {
  
  var queryString = "?name=labnol&blog=ctrlq&type=get";
  
  var url = ScriptApp.getService().getUrl() + queryString;
  
  var options =
      {
        "method"  : "GET",   
        "followRedirects" : true,
        "muteHttpExceptions": true
      };
    
  var result = UrlFetchApp.fetch(url, options);
  
  if (result.getResponseCode() == 200) {
    
    var params = JSON.parse(result.getContentText());
    
    Logger.log('GET Test:');
    Logger.log(url);
    Logger.log(params.name);
    Logger.log(params.blog);
    
  }  
}
