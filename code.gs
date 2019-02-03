
// TODOS
// intent catalog aus Google Sheets ziehen


//
// DEV-TEST STARTER
//

function devTest() {
  var myContext = context();
  var test = tyrionTestRunner(myContext);
  var mailData = {};
  
  test.group('TEST: USERANLAGE', function () {
    mailData = {};
    mailData['from']       = 'user1 <user1@abc.com>';
    mailData['subject']    = 'Neuer user';
    mailData['body-plain'] = 'Ich möchte mich als User registrieren\r\nName: Mustermann, Email: peter@mustermann.com';
    var processResult = processIncomingMail(myContext, mailData);
    test.check('Nachfrage "Firmenname"', function () { 
      test.expect(processResult.responseObjResult.body.indexOf('Firmenname') >= 0);
    });
    
    mailData = {};
    mailData['from']       = 'user1 <user1@abc.com>';
    mailData['subject']    = processResult.responseObjResult.subject;
    mailData['body-plain'] = 'Hier meine Antwort\nFirmenname: Musterfirma';
    var processResult = processIncomingMail(myContext, mailData);
    test.check('Daten vollständig erfasst."', function () { 
      test.expect(processResult.responseObjResult.body.indexOf('Registrierung erfolgreich durchgeführt.') >= 0);
    });
  })
  
  //myContext.log(context, 'checkProcessResult:', "************* MISSING:");
  //myContext.log(context, 'checkProcessResult:', JSON.stringify(checkProcessResult));
  
  
  /*
  
  var mailData = {'subject':'D&O Angebot','from':'user1 <user1@abc.com>','body-plain':'Bitte senden Sie mir ein D & O Angebot\r\nKundenname: ABCGmbH, Umsatz: 2500000,95'}  
  //processIncomingMail(myContext, mailData);
  var IDobj = storeMailToInbox(myContext, mailData);
  var mailParsedData = parseMailBody(myContext, mailData['body-plain'], IDobj);
  var processIDfound = parseProcessID(myContext, mailData);
  var newProcessID = storeMailDataToProcess(myContext, processIDfound, mailParsedData, mailData);
  
  test.group('TEST GROUP 1', function () {
    var b = {};
    test.beforeAll(function () {
      b = { something: 'example' };
    });
      
    test.check('DevTest: Mailparser D&O offer, New ID created', function () {      
      var expected_data = newProcessID;
      test.expect.identical(newProcessID, expected_data);
    });
    
    test.check('DevTest: Mailparser D&O offer, action', function () {      
      var expected_data = 'Create offer';
      test.expect.identical(mailParsedData.intent.action, expected_data);
    });
    
    test.check('DevTest: Mailparser D&O offer, action parameter', function () {      
      var expected_data = 'D&O';
      test.expect.identical(mailParsedData.intent.parameter, expected_data);
    });
    
    test.check('DevTest: Mailparser D&O offer, 4 data points', function () {      
      var expected_data = [{"label":"Kundenname","value":"ABCGmbH"},{"label":"Umsatz","value":"2500000,95"}];
      test.expect.deeplyEqual(mailParsedData.data, expected_data);
    });
  })
  
  var theID = newProcessID;
  
  
  // TODO
  
  
  var validationResult = validateProcessData(myContext, newProcessID);
  var checkProcessResult = checkProcessStep(myContext, newProcessID); 
  var responseObjResult = createResponseText(myContext, newProcessID);
  sendResponseMail(myContext, responseObjResult);
    
  var mailData = {'subject':'Re: D&O Angebot ##ID'+theID+'## Re:xxx','from':'user1 <user1@abc.com>','body-plain':'Deckungssumme: 1.000.000, Mitarbeiter: 700; Branche: IT'} 
  var IDobj = storeMailToInbox(myContext, mailData);
  var mailParsedData = parseMailBody(myContext, mailData['body-plain'], IDobj);
  var processIDfound = parseProcessID(myContext, mailData);
  var newProcessID = storeMailDataToProcess(myContext, processIDfound, mailParsedData, mailData);
  
  test.group('TEST GROUP 2', function () {
    var b = {};
    test.beforeAll(function () {
      b = { something: 'example' };
    });
      
    test.check('DevTest: Mailparser D&O offer, Existing ID found', function () {      
      var expected_data = theID;
      test.expect.identical(newProcessID, expected_data);
    });
    
    test.check('DevTest: Mailparser D&O offer, action', function () {      
      var expected_data = 'Create offer';
      test.expect.identical(mailParsedData.intent.action, expected_data);
    });
    
    test.check('DevTest: Mailparser D&O offer, action parameter', function () {      
      var expected_data = 'D&O';
      test.expect.identical(mailParsedData.intent.parameter, expected_data);
    });
    
    test.check('DevTest: Mailparser D&O offer, 4 data points', function () {      
      var expected_data = [{"label":"Deckungssumme","value":"1000000"},{"label":"Mitarbeiter","value":"700"}, {"label":"Branche","value":"IT"}];
      test.expect.deeplyEqual(mailParsedData.data, expected_data);
    });
  })
  
  */
    
  test.end();
  
}


function validateProcessData(context, processID) {
  /*
  - Lookup current process definition and step in Sheet 'ProcessProductDefinitions'
  - Check, if all filled fields which are alread filled are in the correct format 
  - data types: Currencies, Numbers...
  - valid enums: Check for "list all" command to add ALL available enums in error-text
  - For all errors: Remove filled values, move them to column ERRORS
  */
  
  // select current process Doc
  var processFiddler = context.loadProcessFiddler();
  processFiddler.filterRows (function (row,properties) {
    return ((row.ProcessID == processID) && (row.ProcessCurrent == 'x') );
  });
  var processDoc = processFiddler.getData()[0];
  
  // select current process Defintion
  var processProductDefinitionsFiddler = context.loadProcessProductDefinitionsFiddler();
  processProductDefinitionsFiddler.filterRows (function (row,properties) {
    return ((row.IntentAction == processDoc.IntentAction) && (row.IntentParameter == processDoc.IntentParameter));
  });
  var processDefinitions = processProductDefinitionsFiddler.getData() // Array
  //
  // 1. Check for process step
  //
  var currentProcessStep = processDoc.ProcessStep;
  if (currentProcessStep == ''){
    // no process step defined, use first one
    currentProcessStep = processDefinitions[0].ProcessStep;
  }
}



function checkProcessStep(context, processID) {
  /*
  - Lookup current process definition and step in Sheet 'ProcessProductDefinitions'
  - Check in sheet 'Processes', if all required fields are filled. If yes, set next process step
  */
  
  // select current process Doc
  var processFiddler = context.loadProcessFiddler();
  processFiddler.filterRows (function (row,properties) {
    return ((row.ProcessID == processID) && (row.ProcessCurrent == 'x') );
  });
  var processDoc = processFiddler.getData()[0];
  
  // select current process Defintion
  var processProductDefinitionsFiddler = context.loadProcessProductDefinitionsFiddler();
  processProductDefinitionsFiddler.filterRows (function (row,properties) {
    return ((row.IntentAction == processDoc.IntentAction) && (row.IntentParameter == processDoc.IntentParameter));
  });
  var processDefinitions = processProductDefinitionsFiddler.getData() // Array
  
  //
  // 1. Check for current process step
  //
  var currentProcessStep = processDoc.ProcessStep;
  if (currentProcessStep == ''){
    // no process step defined, use first one
    currentProcessStep = processDefinitions[0].ProcessStep;
  }
  for (var i in processDefinitions) {
    // loop through all process definition steps
    var tempDefinition = processDefinitions[i];
  }
  
  processProductDefinitionsFiddler = context.loadProcessProductDefinitionsFiddler();
  processDefinitions = processProductDefinitionsFiddler.getData() // Array
  
  //
  // 2. Check in sheet 'Processes', if all required fields are filled. If yes, set next process step
  //
  var processData = JSON.parse(processDoc.Data).data;
  var missingRequiredFieldnames = [];
  for (var i in processDefinitions) {
    if ((processDefinitions[i].IntentAction == processDoc.IntentAction) && (processDefinitions[i].IntentParameter == processDoc.IntentParameter) && (processDefinitions[i].ProcessStep == currentProcessStep)) {
      if ((processDefinitions[i].Category == 'Input') && (processDefinitions[i].Required == 'yes')) {       
        var dataFound = false;
        for (var j in processData) {
          if (processData[j].label == processDefinitions[i].Label) {
            dataFound = true;
          } 
        }
        if (dataFound == false) {
          missingRequiredFieldnames.push(processDefinitions[i].Label);
          //context.log(context, 'checkProcessStep:', processDefinitions[i].Label);
        }
      }
    }
  }
  
  //
  // 3. search for next process step:
  //
  // search current process step
  for (var i in processDefinitions) {
    if ((processDefinitions[i].IntentAction == processDoc.IntentAction) && (processDefinitions[i].IntentParameter == processDoc.IntentParameter) && (processDefinitions[i].ProcessStep == currentProcessStep)) {
      break;
    }
  }
  // first match of current process step is Text Display
  var textDisplay = processDefinitions[i].Label;
  // loop until next process step found
  for (j = i; j < processDefinitions.length; j++) {
    if (processDefinitions[j].ProcessStep != currentProcessStep) {
      break;
    }
  }
  
  // return next process step (if no required fields are missing)
  var result = {'textDisplay': textDisplay};
  if (missingRequiredFieldnames.length > 0) {
    // process step not finished, required fields are missing
    result.nextProcessStep = currentProcessStep;
    result.missingRequiredFieldnames = missingRequiredFieldnames;
  }
  else {
    // process step is finished, check if end of process is reached
    if (processDefinitions[j].ProcessStep == 'END OF PROCESS') {
      result.textDisplay = processDefinitions[j].Label;
    }
    result.nextProcessStep = processDefinitions[j].ProcessStep;
    result.missingRequiredFieldnames = [];
  }
  
  return result
  
}


function createResponseText(context, processID, validationResult, checkProcessResult) {
  // select current process Doc
  var processFiddler = context.loadProcessFiddler();
  processFiddler.filterRows (function (row,properties) {
    return ((row.ProcessID == processID) && (row.ProcessCurrent == 'x') );
  });
  var processDoc = processFiddler.getData()[0];
  
  // select current process Defintion
  var processProductDefinitionsFiddler = context.loadProcessProductDefinitionsFiddler();
  processProductDefinitionsFiddler.filterRows (function (row,properties) {
    return ((row.IntentAction == processDoc.IntentAction) && (row.IntentParameter == processDoc.IntentParameter));
  });
  var processDefinitions = processProductDefinitionsFiddler.getData() // Array
  
  
  // Check subject for ID
  var subj = processDoc.Subject
  var regEx_ID = /##ID(\d+)##/gm;
  var ID1 = regEx_ID.exec(subj)
  if (ID1 == null) {
    // nothing found, add ID to subject
    subj = subj + " ##ID" + processID + "##"
  }
  
  // Create mail elements  
  var result = {};
  result.recipient = "test@test.com";
  result.subject = subj
  result.body = checkProcessResult.textDisplay + "\n";
  if (checkProcessResult.missingRequiredFieldnames.length > 0) {
    result.body = result.body + "\nFehlende Felder:";
    for (var i in checkProcessResult.missingRequiredFieldnames) {
      result.body = result.body + "\n - " + checkProcessResult.missingRequiredFieldnames[i] + ": ?";
    }
  }
  
  var processFiddler = context.loadProcessFiddler();
  var now = new Date();
  var outboxID = now.getTime();
  var newProcessDoc = {};
  newProcessDoc.ProcessID = processID;
  newProcessDoc.InboxID = outboxID;
  newProcessDoc.InboxTime = Utilities.formatDate(now, 'Europe/Berlin', 'yyyy-MM-dd HH:mm:ss');
  newProcessDoc.IntentAction = "Feedback Mail";
  newProcessDoc.Subject = subj;
  newProcessDoc.Body = result.body
  processFiddler.insertRows (null, 1, [newProcessDoc]);
  processFiddler.setData(processFiddler.sort ("InboxID"));
  context.setProcessFiddler(processFiddler);
  context.saveProcessFiddler();
  context.log(context, 'Feeback mail', 'Data saved to Process sheet');
  
  return result
}



function emailSendTest() {
  // test: send POST to mailgun to send email
  // https://gist.github.com/gankit/48bdead2699c5af474b51c05f812bce4
  // see https://stackoverflow.com/questions/42015392/urlfetchapp-how-to-simulate-a-http-post-that-have-params-with-same-name-multipl
  // 
  
  var url = "https://api.mailgun.net/v3/sandbox90b306acfd024419929095b3c4837293.mailgun.org/messages";
  var payload =
      {
        "from" : "Bot <bot@sandbox90b306acfd024419929095b3c4837293.mailgun.org>",
        "to" : "ansgar.knipschild@mgm-tp.com",
        "subject" : "hello!",
        "text" : "hello world"
      }; 
  var options =
      {
        "method"  : "POST",
        "payload" : payload,
        "muteHttpExceptions": true,
        "headers": {'Authorization': 'Basic ' + Utilities.base64Encode("api:"+context().mailgunKey)}
      }; 
  var result = UrlFetchApp.fetch(url, options);
  if (result.getResponseCode() == 200) {   
    var params = JSON.parse(result.getContentText());
    context().log(context(), 'mail sent', JSON.stringify(params))
  }
  else {
    context().log(context(), 'mail error', result.getContentText())
  }
}


//
//
//


// Receive incoming POST (email by Mailgun or Zappier)
function doPost(e) {  
  if(typeof e !== 'undefined')
    {
      //
      // => IMPORTANT! ALL CHANGES HERE HAVE TO BE PUBLISHED TO BE EFFECTIVE => MENU 'PUBLISH / DEPLOY AS WEB-APP...' !!! (PUBLIC API)
      //
      var myContext = context();
      myContext.log(myContext, 'POST received', JSON.stringify(e.parameter));
      var processResult = processIncomingMail(myContext, e.parameter);
      sendResponseMail(myContext, processResult.responseObjResult); 
  
      //return ContentService.createTextOutput(JSON.stringify(e.parameter));
      
      // Avoid long running tasks / responses:
      // https://stackoverflow.com/questions/52442261/doposte-how-to-immediately-response-http-200-ok-then-do-long-time-function
      
    }
}

function processIncomingMail(myContext, mailData) {
  //
  // => IMPORTANT! ALL CHANGES HERE HAVE TO BE PUBLISHED TO BE EFFECTIVE => MENU 'PUBLISH / DEPLOY AS WEB-APP...' !!! (PUBLIC API)
  //
  myContext.log(myContext, 'processIncomingMail', JSON.stringify(mailData));
  
  var IDobj = storeMailToInbox(myContext, mailData);
  var mailParsedData = parseMailBody(myContext, mailData['body-plain'], IDobj);
  var processIDfound = parseProcessID(myContext, mailData);
  var newProcessID = storeMailDataToProcess(myContext, processIDfound, mailParsedData, mailData);
  var validationResult = validateProcessData(myContext, newProcessID);
  var checkProcessResult = checkProcessStep(myContext, newProcessID); 
  var responseObjResult = createResponseText(myContext, newProcessID, validationResult, checkProcessResult);
  
  var result = {};
  result.IDobj = IDobj;
  result.mailParsedData = mailParsedData;
  result.processIDfound = processIDfound;
  result.newProcessID = newProcessID;
  result.validationResult = validationResult;
  result.checkProcessResult = checkProcessResult;
  result.responseObjResult = responseObjResult;
  
  return result;
  
}

function parseProcessID(context, mailData) {
  var processID = '';
  // ##ID77777##
  // parse mailData.subject
  // parse mailData['body-plain']
  
  var regEx_ID = /##ID(\d+)##/gm;
  var ID1 = regEx_ID.exec(mailData.subject)
  if (ID1 == null) {
    // nothing found, search in body
    var ID2 = regEx_ID.exec(mailData['body-plain']);
    if (ID2 == null) {
      // nothing found, create new one
      processID = 'new'
    }
    else {
      processID = ID2[1]; // first regex-Group match
    }
  }
  else {
    processID = ID1[1]; // first regex-Group match
  }

  return processID
}

function storeMailDataToProcess(context, processIDfound, mailParsedData, mailData) {
  var processFiddler = context.loadProcessFiddler();
  var now = new Date();
  var processID = now.getTime();
  context.log(context, 'test match', JSON.stringify(mailParsedData));
  //processIDfound = 'new';
  
  var newProcessDoc = {};
  
  if (processIDfound == 'new') {
    // create new process
    newProcessDoc.ProcessID = processID;
    //newProcessDoc.ProcessStep = 'Input Calculation Data';
  }
  else
  {
    processID = processIDfound;
    // copy & update existing process
    //
    // get last process doc
    processFiddler.filterRows (function (row,properties) {
      return ((row.ProcessID == processID) && (row.ProcessCurrent == 'x') );
    });
    var lastProcessDoc = processFiddler.getData()[0];
    // reset filter (not very elegant...)
    processFiddler = context.loadProcessFiddler();
    // reset status 'ProcessCurrent' of all matches
    var allProcessIDmatches = processFiddler.selectRows('ProcessID',function (value , properties) {
      return value == processIDfound;
    });
    allProcessIDmatches.map(function(d) {
      return processFiddler.getData()[d].ProcessCurrent = '';
    })
    
    // copy last process line/object to new object (full object)
    newProcessDoc = {};
    for (var attr in lastProcessDoc) {
        if (lastProcessDoc.hasOwnProperty(attr)) newProcessDoc[attr] = lastProcessDoc[attr];
    }
    // merge Data objects : last process line PLUS mail data
    var oldDataArray = JSON.parse(lastProcessDoc.Data).data; // Array
    for (var i in mailParsedData.data) {
      var tempSearchFor = mailParsedData.data[i];
      var updatedFlag = false;
      for (var j in oldDataArray) {
        if (tempSearchFor.label == oldDataArray[j].label) {
          // replace existing data
          oldDataArray[j].value = tempSearchFor.value;
          updatedFlag = true
          break;
        }
      }
      if (updatedFlag == false) {
        // add new data, if not updated above
        var tmp_obj = {};
        tmp_obj['label'] = tempSearchFor.label;
        tmp_obj['value'] = tempSearchFor.value;
        oldDataArray.push(tmp_obj);  
      }
    }    
    mailParsedData.data = oldDataArray;
    // check for empty/unknown intent (nothing defined in email), copy last intent
    if (mailParsedData.intent.action == 'unknown') {
      mailParsedData.intent.action = JSON.parse(lastProcessDoc.Data).intent.action;
      mailParsedData.intent.parameter = JSON.parse(lastProcessDoc.Data).intent.parameter;
    }
  }
  
  newProcessDoc.InboxID = mailParsedData.InboxID;
  newProcessDoc.InboxTime = mailParsedData.InboxTime;
  newProcessDoc.IntentAction = mailParsedData.intent.action;
  newProcessDoc.IntentParameter = mailParsedData.intent.parameter;
  newProcessDoc.From = mailData.from;
  newProcessDoc.Subject = mailData.subject;
  newProcessDoc.Body = mailData["body-plain"];
  newProcessDoc.ProcessCurrent = 'x';
  newProcessDoc.Data = JSON.stringify(mailParsedData);
  
  // copy data from mail to process doc (if column existing)
  for (var i in mailParsedData.data) {
    if (processFiddler.getData()[1].hasOwnProperty(mailParsedData.data[i].label)) {
      newProcessDoc[mailParsedData.data[i].label] = mailParsedData.data[i].value;
    }
  }
  
  processFiddler.insertRows (null, 1, [newProcessDoc]);
  //context.log(context, 'test match', mailParsedData);
  
  
  processFiddler.setData(processFiddler.sort ("InboxID"));
  context.setProcessFiddler(processFiddler);
  context.saveProcessFiddler();
  context.log(context, 'processIncomingMail', 'Data saved to Process');
  
  
  return processID
}


function storeMailToInbox(context, mailData) {
  // store Mail to spreadsheet
  
  var inboxFiddler = context.loadInboxFiddler();
  var now = new Date();
  var InboxID = now.getTime();
  var InboxTime = Utilities.formatDate(now, 'Europe/Berlin', 'yyyy-MM-dd HH:mm:ss');
  
  inboxFiddler.insertRows ( null , 1 , [{
    "InboxID": InboxID,
    "InboxTime": InboxTime,
    "Source": "EMAIL",
    "From": mailData.from,
    "Subject": mailData.subject,
    "Body": mailData["body-plain"],
    "Data": JSON.stringify(mailData)
    }]);
  inboxFiddler.setData(inboxFiddler.sort ("InboxID"));
  context.setInboxFiddler(inboxFiddler);
  context.saveInboxFiddler();
  context.log(context, 'processIncomingMail', 'Mail saved to Inbox Sheet');
  return {"InboxID": InboxID, "InboxTime": InboxTime}
}



function sendResponseMail(context, responseObj) {
 
  // send POST to mailgun to send email
  // https://gist.github.com/gankit/48bdead2699c5af474b51c05f812bce4
  // see https://stackoverflow.com/questions/42015392/urlfetchapp-how-to-simulate-a-http-post-that-have-params-with-same-name-multipl
  // 
  var url = "https://api.mailgun.net/v3/sandbox90b306acfd024419929095b3c4837293.mailgun.org/messages";
  var payload =
      {
        "from" : "Bot <bot@sandbox90b306acfd024419929095b3c4837293.mailgun.org>",
        "to" : "ansgar.knipschild@mgm-tp.com",
        "subject" : responseObj.subject,
        "text" : responseObj.body
      }; 
  // responseObj.recipient
  var options =
      {
        "method"  : "POST",
        "payload" : payload,
        "muteHttpExceptions": true,
        "headers": {'Authorization': 'Basic ' + Utilities.base64Encode("api:"+context.mailgunKey)}
      }; 
  var result = UrlFetchApp.fetch(url, options);
  if (result.getResponseCode() == 200) {   
    var params = JSON.parse(result.getContentText());
    context.log(context, 'mail sent', JSON.stringify(params))
  }
  else {
    context.log(context, 'mail error', result.getContentText())
  }
  
  
  
  /*
  //send POST to Zappier to send email
  var url = "https://hooks.zapier.com/hooks/catch/4104424/c4twwa";
  var payload =
      {
        "subject" : "hello",
        "content" : "hello world"
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
    context.log(context, 'mail sent', JSON.stringify(params))
  }
  */
  
  

}




function parseMailBody(context, fullMailBody, IDobj) {
  // https://regexr.com
  // http://regexlib.com/
  // https://regex101.com 
  // https://www.debuggex.com
  // https://developer.mozilla.org/de/docs/Web/JavaScript/Guide/Regular_Expressions
  
  // Shorten full mail text to last mail reply ('von/from/...' at line beginning as separator)
  var regEx_LastMail = /((.|\r|\n)*?)^(von:|from:|betreff:|subject:)/gmi;
  var LastMail = regEx_LastMail.exec(fullMailBody)
  if (LastMail == null) {
    LastMail = fullMailBody.trim(); 
  }
  else {
    LastMail = LastMail[1].trim(); // first regex-Group match, leading/trailing spaces removed
  }
  
  // Step 1
  // Check for intents
  // All intents are stored in one 'catalog', ordered by priority (search stops after first match)
  
  // reused search components
  var want = "(want|möchte|hätte gerne|bitte schicken sie|.*)";
  var d_o = "(hpdo|d&o|d & o)";
  var cyber = "(hpcy|cyber)";
  var offer = "(offer|angebot|prämie|berechnung)";
  
  var intent_catalog = [
    {
      intent: {action: 'Register user', parameter: ''},
      searches: [
        want+"(?=.*(registrieren|anmelden))"
      ]
    },
    {
      intent: {action: 'Create offer', parameter: 'Cyber'},
      searches: [
        want+"(?=.*"+offer+")(?=.*"+cyber+")",
        want+"(?=.*"+cyber+")(?=.*"+offer+")"
      ]
    },
    {
      intent: {action: 'Create offer', parameter: 'D&O'},
      searches: [
        want+"(?=.*"+offer+")(?=.*"+d_o+")",
        want+"(?=.*"+d_o+")(?=.*"+offer+")"
      ]
    }
  ]
  
  var label_catalog = [
    {
      label: 'Umsatz',
      searches: [
        "turnover",
        "umsatz|Gesamtumsatz|Au(ss|ß)en(-)*umsatz"
      ]
    }
  ]
  
  // Loop throug intent catalog and search for matches
  // Stop after first match
  for (var ii in intent_catalog) {
    var intent ={action: 'unknown', parameter: ''};
    var intent_found_counter = 0;
    for (var jj in intent_catalog[ii].searches) {
      var intent_found_tmp = (LastMail.search(new RegExp(intent_catalog[ii].searches[jj], "gmi")) == -1) ? 0 : 1;
      intent_found_counter = intent_found_counter + intent_found_tmp;
    }
    if (intent_found_counter > 0) {
      intent = intent_catalog[ii].intent;
      break; // stop after first match
    }
  }
  
  
  // Step 2
  // Extract value pairs, separated by : or =
  var regEx_Data1 = /([a-zA-Z ]+)[\:=]\s*([a-zA-Z@.]+|([0-9,.]+))/gm;
  var Data1 = LastMail.match(regEx_Data1)

  // Loop through value pairs, split, clean
  var Data2 =[]
  for (var i in Data1) {
    // replace = delimiter by : and tremove leading/trailing spaces
    var tmp = Data1[i].replace(/=/g, ':').trim(); 
    // split by :
    var tmp_split = tmp.split(':') 
    var data_label = tmp_split[0].trim();
    var data_value = tmp_split[1].trim();
    
    // check for thousend decimal separator '.' and remove it
    data_value = data_value.replace(/(\d+)\.(?=\d{3}(\D|$))/g, "$1");
    
    // check for comma/semicolon separator at the end and remove it: eg. 500,90,
    //data_value = data_value.replace(/(\d+,\d+),/g, "$1");
    data_value = data_value.replace(/(\d+)[,;]$/g, "$1");
    
    // loop through label catalog and standardize label
    for (var ii in label_catalog) {
      var label_found_counter = 0;
      for (var jj in label_catalog[ii].searches) {
        var label_found_tmp = (data_label.search(new RegExp(label_catalog[ii].searches[jj], "gmi")) == -1) ? 0 : 1;
        label_found_counter = label_found_counter + label_found_tmp;
      }
      if (label_found_counter > 0) {
        data_label = label_catalog[ii].label;
        break; // stop after first match
      }
    }
    
    // generate JSON data objects
    var tmp_obj = {};
    tmp_obj['label'] = data_label;
    tmp_obj['value'] = data_value;
    Data2.push(tmp_obj);
  }
  
  var result_obj = {
    'intent': intent,
    'InboxID': IDobj.InboxID, 
    'InboxTime': IDobj.InboxTime,
    'data': Data2
    }
  
  context.log(context, 'parseMailBody', JSON.stringify(result_obj));
  
  return result_obj
}

function dev_notes() {
  
  var fullMailBody_64 = 'emVpbGUgMQp6ZWlsZSAyCgpWb246IGFrbmlwQHdlYi5kZSBbbWFpbHRvOmFrbmlwQHdlYi5kZV0KR2VzZW5kZXQ6IE1vbnRhZywgNy4gSmFudWFyIDIwMTkgMjA6NDcKQW46IEFuc2dhciBLbmlwc2NoaWxkCkJldHJlZmY6IEF3OiBXRzogVGVzdAoKUmVwbHkgdm9uIHdlYi5kZQpaZWlsZSAyCgpHZXNlbmRldDogTW9udGFnLCAwNy4gSmFudWFyIDIwMTkgdW0gMjA6NDUgVWhyClZvbjogIkFuc2dhciBLbmlwc2NoaWxkIiA8QW5zZ2FyLktuaXBzY2hpbGRAbWdtLXRwLmNvbTxtYWlsdG86QW5zZ2FyLktuaXBzY2hpbGRAbWdtLXRwLmNvbT4+CkFuOiAiYWtuaXBAd2ViLmRlPG1haWx0bzpha25pcEB3ZWIuZGU+IiA8YWtuaXBAd2ViLmRlPG1haWx0bzpha25pcEB3ZWIuZGU+PgpCZXRyZWZmOiBXRzogVGVzdAoKClZvbjogQW5zZ2FyIEtuaXBzY2hpbGQgW21haWx0bzprbmlwc2NoaWxkQGdvb2dsZW1haWwuY29tXQpHZXNlbmRldDogTW9udGFnLCA3LiBKYW51YXIgMjAxOSAyMDo0MwpBbjogQW5zZ2FyIEtuaXBzY2hpbGQKQmV0cmVmZjogUmU6IFRlc3QKClJlcGx5IDMgKHZvbiBHbWFpbCkKWmVpbGUgMgoKQW0gTW8uLCA3LiBKYW4uIDIwMTkgdW0gMjA6NDEgVWhyIHNjaHJpZWIgQW5zZ2FyIEtuaXBzY2hpbGQgPEFuc2dhci5Lbmlwc2NoaWxkQG1nbS10cC5jb208bWFpbHRvOkFuc2dhci5Lbmlwc2NoaWxkQG1nbS10cC5jb20+PjoKQm9keSAxCkJvZHkgMgoKVm9uOiBBbnNnYXIgS25pcHNjaGlsZApHZXNlbmRldDogTW9udGFnLCA3LiBKYW51YXIgMjAxOSAyMDo0MgpBbjogQW5zZ2FyIEtuaXBzY2hpbGQKQmV0cmVmZjogQVc6IFRlc3QKClJlcGx5IDEKWmVpbGUgMgoKVm9uOiBBbnNnYXIgS25pcHNjaGlsZApHZXNlbmRldDogTW9udGFnLCA3LiBKYW51YXIgMjAxOSAyMDo0MgpBbjogQW5zZ2FyIEtuaXBzY2hpbGQKQmV0cmVmZjogVGVzdAoKQm9keSAxCkJvZHkgMgo='
  var fullMailBody_64_LZW = 'emVpbGUgMQp6ZWlsZSAyCgpWb246IGFrbmlwQHdlYi5kĐBbbWFăHRvOmĞĠĢĤĦĨĪZV0KR2VzČľXQěE1vbnRhZywgNy4gSķudİyIDIwMTkćjA6NDcKQWĚIEFuc2dhciBLĹwŷNoaWxkCkJldHƊZmYŋF3OżXRzogVGŅdAoKUāwbHŧdm9uIĥħĩīĉaČĎĐĒĔpHZXNlĠRƋDƚTWƫdĝnLCAwŗřśŵŞFŠŢŤŦgŞ0ŨŪŬĆVWhēlZŎjƚIkŵŷŹŻŽſƁƃƅkIiA8Ű5ņ2ǓLktuaXBzY2hăGRAįdtLƗwLmNŎTxtYčsǇ86ǸǺǼǾȀȂȄȆȈȊȌȎȐȒȔbT4+ƈŵƕAișǿȁBAdńiȒǀPG1hƄx0bzpɄ25pcEB3ČIuZą+ǴǶȷȣȺȼVȾmɀɂɄƅɇɉɋɍɏɑɓɕɗPĕCƻRyČƏƕBƗƙƛƝzƟơCǣǥƚȟZǻŠEȸȤȅȇĄQgW2ɃɅɦpğġƀ2ƂɅkQGdŎŸďWʒWwuȅ9tŉƹƻƽƿǁǃǅŝǈǊA3LżKș51YXIǛxOđyMǂ0MwpĭǦgʄʆųʉȃʋȈQůā0cāmZˍƣUěFǀc3˖ʀƊcGx5šMgKƺŎżHįıbƈKWāȈĆˮơŰǚǄ8uʵʷʹș4ƬǕťƨWǚMũūDEƛǠŠHNjaƍpɓˎWǹʅǓˑɜȥʌGʎPŴŶŸźĩžʗǰʛʝ1nbS1˙C5jĘ08˵ĲĴOǩ̬Ǭ̯ǯʙǱƆ̴̶̸̺̼̾+PǦ˗9keđxƈJvZƧćgơVƪuɷĭnNnʾˀSɌɎ̘̚GƵAʬƼƾɡʰgǄǆʴǋ̆Bʺ̠ʽʿˁ˃Ēˆoˈĕˌʃ̠Ƞʇ˒̦˕˗ŀ˚ͤ˝ʃVcˡˣ˥K˧l˩˫šE˹˻Ą˽͢KͤƫͧŏͪͬŚͯcͱaͳď͵ƺͷʯdǂͻʲǇFǉͿʸ΁ʻ΄ˀ̐A˂˄Ή΋ˋbˍˏ̣ʈ̥˔ʍΕ˙˛ΙɻƞƠ͖͚͘͜͞͠˾=' 

}


function mylog(context, header, message) {
  
}

function log_syntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
  return '<span class="' + cls + '">' + match + '</span>';
  });
}



function google_dialog_test() {
  var now = new Date();
  //mydate = Utilities.formatDate(now, 'Europe/Berlin', 'MMMM dd, yyyy HH:mm:ss Z')
  mydate = Utilities.formatDate(now, 'Europe/Berlin', 'dd.MM.')
  Browser.msgBox('Hello', 'Datum: ' + mydate, Browser.Buttons.YES_NO)
  url = ScriptApp.getService().getUrl()
  Logger.mylog(url)
}

// Base64 Encoder
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
// Encode the String
// var encodedString = Base64.encode(input);  
// Decode the String
// var decodedString = Base64.decode(encodedString);

// LZW compressor
function LZWencode(c){var x='charCodeAt',b,e={},f=c.split(""),d=[],a=f[0],g=256;for(b=1;b<f.length;b++)c=f[b],null!=e[a+c]?a+=c:(d.push(1<a.length?e[a]:a[x](0)),e[a+c]=g,g++,a=c);d.push(1<a.length?e[a]:a[x](0));for(b=0;b<d.length;b++)d[b]=String.fromCharCode(d[b]);return d.join("")}
function LZWdecode(b){var a,e={},d=b.split(""),c=f=d[0],g=[c],h=o=256;for(b=1;b<d.length;b++)a=d[b].charCodeAt(0),a=h>a?d[b]:e[a]?e[a]:f+c,g.push(a),c=a.charAt(0),e[o]=f+c,o++,f=a;return g.join("")}


