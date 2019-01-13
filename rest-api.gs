function doGet(e) {

  if(typeof e !== 'undefined')
    {
    mylog(appMode, 'GET', JSON.stringify(e.parameter))
    
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