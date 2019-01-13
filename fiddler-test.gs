function fiddlerTest() {
  
  // source data from external sheet
  var sheetValues = SpreadsheetApp
    //.openById('1h9IGIShgVBVUrUjjawk5MaCEQte_7t32XeEP1Z5jXKQ')
    .openById(context().spreadsheetID)
    .getSheetByName('fiddleTest_input')
    .getDataRange()
    .getValues();
    
  // where to write the tests.. change this some sheet of your own.
  var fiddleRange =  SpreadsheetApp
    .openById(context().spreadsheetID)
    .getSheetByName('fiddleTest_output')
    .getDataRange();  
  
  // get a fiddler
  var fiddler = new Fiddler();
  
  // set data by spreadsheet
  //fiddler.setValues (sheetValues);
  
  // can also set data via an object rather than values
  fiddler.setData([
    {name:'john',last:'smith'},
    {name:'jane',last:'doe'}
  ]);

  var data = fiddler.getData();

  Logger.log(JSON.stringify(data[0], 0, 2))  
  
  // write to a sheet and take a look
  showFiddler (fiddler , fiddleRange);
  return;
}


function showFiddler (fiddlerObject , outputRange) {
  // clear and write result 
  outputRange
  .getSheet()
  .clearContents();
  
  fiddlerObject
  .getRange(outputRange)
  .setValues(fiddlerObject.createValues());
}