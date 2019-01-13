
// clean Object without using 'this'
// including public and private functions
// see https://medium.freecodecamp.org/removing-javascripts-this-keyword-makes-it-a-better-language-here-s-why-db28060cc086

function vanillaObject(param) {
  var myVar = 2;
  function private1() {
    
  }
  function public1() {
    Logger.log(myVar);
    myVar = myVar + 1;
  }
  function public2() {
    Logger.log(myVar);
    Logger.log(param);
  }
  // public functions (API)
  return Object.freeze({
    public1: public1,
    public2: public2
  });
}

/*
var myVanillaObject = vanillaObject(4711);

myVanillaObject.public1()
myVanillaObject.public2()
*/


// 
// aus Sheet "Marketing Planung 2018"
// https://docs.google.com/spreadsheets/d/19wQpCJwdSfoATWhfcaxAkuSVw_Sp2ldjx4_6lrr4go8/edit?usp=sheets_web
//



function sort() {
  
  // source: https://gist.github.com/sco-tt/b3f07c1882ac698afc74
  
  /**  Variables for customization:
  
  Each column to sort takes two variables: 
      1) the column index (i.e. column A has a colum index of 1
      2) Sort Asecnding -- default is to sort ascending. Set to false to sort descending
  
  **/

  //Variable for column to sort first
  
  var sortFirst = 2; //index of column to be sorted by; 1 = column A, 2 = column B, etc.
  var sortFirstAsc = true; //Set to false to sort descending
  
  //Variables for column to sort second
 
  var sortSecond = 3;
  var sortSecondAsc = false;
  
  //Number of header rows
  
  var headerRows = 1; 

  /** End Variables for customization**/
  
  /** Begin sorting function **/

  var activeSheet = SpreadsheetApp.getActiveSheet();
  var sheetName = activeSheet.getSheetName(); //name of sheet to be sorted
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var range = sheet.getRange(headerRows+1, 1, sheet.getMaxRows()-headerRows, sheet.getLastColumn());
  range.sort([{column: sortFirst, ascending: sortFirstAsc}, {column: sortSecond, ascending: sortSecondAsc}]);
}


function createOverview() {

  var xOffset = 3;

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var input_sheet = spreadsheet.getSheetByName("Tasks");
  var input_sheet_data = input_sheet.getDataRange();
  var input_sheet_rows = input_sheet_data.getNumRows();
  
  // input_sheet.getRange(input_sheet_rows+3,2).setValue('hello');
  
  // Create new sheet for report  
  var resource_name = "Overview"
  var report_name = resource_name + " - " + Utilities.formatDate(new Date(), 'Europe/Berlin', 'dd.MM.');
  var report_sheet = spreadsheet.getSheetByName(report_name);
  if (report_sheet != null) {
    // if sheet already exists delete it!
    spreadsheet.deleteSheet(report_sheet);
  }
  // report_sheet = spreadsheet.insertSheet();
  var report_sheet = spreadsheet.getSheetByName(resource_name).copyTo(spreadsheet);
  SpreadsheetApp.flush(); // Utilities.sleep(2000);
  report_sheet.setName(report_name);
  
  var report_sheet_data = report_sheet.getDataRange();
  var report_sheet_rows = report_sheet_data.getNumRows();
  var emptyrow_range = report_sheet.getRange(7,1,1,99);  // row, col, number-of-rows, number-of-columns
  
  var report_row = 4;
  
  spreadsheet.setActiveSheet(report_sheet);
  
  
  
  
  var pos = xOffset;
  
  // loop through task sheet
  var last_project = "";
  var last_name = "";
  //var last_project = input_sheet.getRange(2, 3).getValue();
  //var last_name = input_sheet.getRange(2, 8).getValue();
  
  for (var i = 2; i <= input_sheet_rows; i++) {
  //for (var i = 2; i <= 15; i++) {
      var tmp_project = input_sheet.getRange(i, 3).getValue();
      var tmp_name = input_sheet.getRange(i, 8).getValue();
      var tmp_taskname = input_sheet.getRange(i, 6).getValue();
      var tmp_ticketnr = input_sheet.getRange(i, 16).getValue();
      var tmp_duration = input_sheet.getRange(i, 7).getValue();
      var tmp_fixdate = input_sheet.getRange(i, 12).getValue();
      var tmp_color = input_sheet.getRange(i, 5).getBackground();
      
      if (tmp_project != last_project) {
          report_row = report_row + 5;
          report_sheet.getRange(report_row, xOffset-1).setValue('Projekt')
          report_sheet.getRange(report_row+1, xOffset-1).setValue(tmp_project)  
      }
      else {
        if (tmp_name != last_name) {
            report_row = report_row + 4;
            
        }
      }
      
      if (input_sheet.getRange(i, 19).getValue() != "") {
        var resource_sheet = spreadsheet.getSheetByName(input_sheet.getRange(i, 17).getValue());
        
        var resource_range=resource_sheet.getDataRange();
        var resource_data=resource_range.getValues();
        
        //report_sheet.getRange(report_row + 7, xOffset+1).setValue('log-info: ' + found_y + "/" + found_x);
        
        for (var j = input_sheet.getRange(i, 19).getValue(); j <= input_sheet.getRange(i, 20).getValue(); j++) {
            var copy_from = resource_sheet.getRange(input_sheet.getRange(i, 18).getValue(), j);
            report_sheet.getRange(report_row, j).setValue(copy_from.getValue()); 
            //report_sheet.getRange(report_row, j).setBackground(copy_from.getBackground()); 
            report_sheet.getRange(report_row, j).setBackground(input_sheet.getRange(i, 2).getBackground()); 
            report_sheet.getRange(report_row, j).setFontColor(copy_from.getFontColor()); 
            if (j==input_sheet.getRange(i, 19).getValue()) {
              report_sheet.getRange(report_row-1, j).setValue(tmp_name); 
              report_sheet.getRange(report_row+1, j).setValue(tmp_taskname); 
              report_sheet.getRange(report_row, j).setValue('=HYPERLINK' + '("https://jira.mgm-tp.com/jira/browse/MARK-'+copy_from.getValue()+'";"'+copy_from.getValue()+'")'        );
              
            }
        }
      }
      
      var last_project = tmp_project;
      var last_name = tmp_name;
     
      
  }

}



function createPlanning() {

  var xOffset = 3;

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var input_sheet = spreadsheet.getSheetByName("Tasks");
  var input_sheet_data = input_sheet.getDataRange();
  var input_sheet_rows = input_sheet_data.getNumRows();
  
  // input_sheet.getRange(input_sheet_rows+3,2).setValue('hello');
  
  // Create new sheet for report  
  var resource_name = "Daniel"
  var report_name = resource_name + " - " + Utilities.formatDate(new Date(), 'Europe/Berlin', 'dd.MM.');
  var report_sheet = spreadsheet.getSheetByName(report_name);
  if (report_sheet != null) {
    // if sheet already exists delete it!
    spreadsheet.deleteSheet(report_sheet);
  }
  // report_sheet = spreadsheet.insertSheet();
  var report_sheet = spreadsheet.getSheetByName(resource_name).copyTo(spreadsheet);
  SpreadsheetApp.flush(); // Utilities.sleep(2000);
  report_sheet.setName(report_name);
  
  var report_sheet_data = report_sheet.getDataRange();
  var report_sheet_rows = report_sheet_data.getNumRows();
  var emptyrow_range = report_sheet.getRange(7,1,1,99);  // row, col, number-of-rows, number-of-columns
  
  // clean up report_sheet, clear all rows
  //for (var i = 8; i <= report_sheet_rows; i++) {
  //    emptyrow_range.copyTo(report_sheet.getRange(i,1));
  //}
  
  var report_row = report_sheet_rows + 4;
  for (var i = 0; i <= 5; i++) {
      emptyrow_range.copyTo(report_sheet.getRange(report_row+i,1));
  }
  
  spreadsheet.setActiveSheet(report_sheet);
  
  
  report_sheet.getRange(report_row, xOffset-1).setValue('Planung ')
  report_sheet.getRange(report_row+1, xOffset-1).setValue((new Date()).toLocaleDateString())
  
  // loop through task sheet
  var pos = xOffset;
  
  // 1. round: Enter fixed dates
  for (var i = 2; i <= input_sheet_rows; i++) {
      var tmp_name = input_sheet.getRange(i, 8).getValue();
      var tmp_taskname = input_sheet.getRange(i, 6).getValue();
      var tmp_ticketnr = input_sheet.getRange(i, 16).getValue();
      var tmp_duration = input_sheet.getRange(i, 7).getValue();
      var tmp_fixdate = input_sheet.getRange(i, 12).getValue();
      var tmp_color = input_sheet.getRange(i, 5).getBackground();
      // filter by resource name
      if (tmp_name == resource_name ) {
        // check if fixed start date available
        if (tmp_fixdate ) {
          tmp_fixdate = new Date(tmp_fixdate.getTime());
          // search for date position
          for (var jj = xOffset; jj <= 50; jj++) {
            var tmp_date = new Date(report_sheet.getRange(4, jj).getValue().getTime());
            if (parseInt(tmp_date-tmp_fixdate) == 0) {   // check for difference between planned time and timeline = 0
                pos = jj;
            }
          }     
          // Draw bars
          var temp_pos = 0;
          for (var j = 1; j <= tmp_duration; j++) {
            // Skip box if blocked by free time or weekend
            while ((report_sheet.getRange(6, pos+j-1+temp_pos).getValue() != "") || (report_sheet.getRange(5, pos+j-1+temp_pos).getValue() == "SA" ) || (report_sheet.getRange(5, pos+j-1+temp_pos).getValue() == "SO" )) {
              if (j > 1) {
                //report_sheet.getRange(report_row, pos+j-1+temp_pos).setBorder(true, null, true, null, false, false, tmp_color, SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
                report_sheet.getRange(report_row, pos+j-1+temp_pos).setBackground(tmp_color);
                report_sheet.getRange(report_row, pos+j-1+temp_pos).setFontColor("black");
                report_sheet.getRange(report_row, pos+j-1+temp_pos).setValue("IIIIIIIIIIIII")
              }
              temp_pos = temp_pos+1;
            }
            
            report_sheet.getRange(report_row, pos+j-1+temp_pos).setBackground(tmp_color);
            if (j == 1) {
              //report_sheet.getRange(report_row, pos+j-1+temp_pos).setValue(tmp_ticketnr);  
              report_sheet.getRange(report_row, pos+j-1+temp_pos).setValue('=HYPERLINK' + '("https://jira.mgm-tp.com/jira/browse/MARK-'+tmp_ticketnr+'";"'+tmp_ticketnr+'")'        );
              report_sheet.getRange(report_row, pos+j-1+temp_pos).setFontColor("white");
              report_sheet.getRange(report_row, pos+j-1+temp_pos).setHorizontalAlignment("left");
              // store calculated bar position in task table
              input_sheet.getRange(i, 17).setValue(report_name);
              input_sheet.getRange(i, 18).setValue(report_row);
              input_sheet.getRange(i, 19).setValue(pos+j-1+temp_pos);
            }
            if (j == tmp_duration) {
              // store calculated bar position in task table
              input_sheet.getRange(i, 20).setValue(pos+j-1+temp_pos);
            }
          }
        }
      }   
  }
  
  
  // 2. round: Fill up flexible tasks by priority
  for (var i = 2; i <= input_sheet_rows; i++) {
      var tmp_name = input_sheet.getRange(i, 8).getValue();
      var tmp_taskname = input_sheet.getRange(i, 7).getValue();
      var tmp_ticketnr = input_sheet.getRange(i, 16).getValue();
      var tmp_duration = input_sheet.getRange(i, 7).getValue();
      var tmp_fixdate = input_sheet.getRange(i, 12).getValue();
      var tmp_color = input_sheet.getRange(i, 5).getBackground();
      // filter by resource name
      if (tmp_name == resource_name ) {
        // check if fixed start date available
        if (tmp_fixdate == "") {
          // Search for first free slot, beginng from left
          pos = xOffset;
          var j = 0;
          while ((j < 50) && (pos == xOffset)) {
            if (report_sheet.getRange(report_row, pos+j).getValue() == "") {
              // check if task fits
              var check_pos = 0;
              var check_offset = 0;
              
              while (((report_sheet.getRange(report_row, pos+j+check_offset).getBackground() == "#efefef") || (report_sheet.getRange(report_row, pos+j+check_offset).getBackground() == "#fff2cc")) && (check_pos < tmp_duration)) {
                 if ((report_sheet.getRange(6, pos+j+check_offset).getValue() == "") && (report_sheet.getRange(5, pos+j+check_offset).getValue() != "SA" ) && (report_sheet.getRange(5, pos+j+check_offset).getValue() != "SO" )) {
                   check_pos = check_pos + 1;
                 }
                 check_offset = check_offset + 1;
              }
              if (check_pos == tmp_duration) {
                pos = xOffset+j; // triggers exit of while-loop
                // Draw bars
                var temp_pos = 0;
                for (var j = 1; j <= tmp_duration; j++) {
                  // Skip box if blocked by free time or weekend
                  while ((report_sheet.getRange(6, pos+j-1+temp_pos).getValue() != "") || (report_sheet.getRange(5, pos+j-1+temp_pos).getValue() == "SA" ) || (report_sheet.getRange(5, pos+j-1+temp_pos).getValue() == "SO" )) {
                    if (j > 1) {
                      //report_sheet.getRange(report_row, pos+j-1+temp_pos).setBorder(true, null, true, null, false, false, tmp_color, SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
                      report_sheet.getRange(report_row, pos+j-1+temp_pos).setBackground(tmp_color);
                      report_sheet.getRange(report_row, pos+j-1+temp_pos).setFontColor("black");
                      report_sheet.getRange(report_row, pos+j-1+temp_pos).setValue("IIIIIIIIIIIII")
                    }
                    temp_pos = temp_pos+1;
                  }
                  report_sheet.getRange(report_row, pos+j-1+temp_pos).setBackground(tmp_color);
                  if (j == 1) {
                    //report_sheet.getRange(report_row, pos+j-1+temp_pos).setValue(tmp_ticketnr);  
                    report_sheet.getRange(report_row, pos+j-1+temp_pos).setValue('=HYPERLINK' + '("https://jira.mgm-tp.com/jira/browse/MARK-'+tmp_ticketnr+'";"'+tmp_ticketnr+'")'        );
                    report_sheet.getRange(report_row, pos+j-1+temp_pos).setFontColor("white");
                    report_sheet.getRange(report_row, pos+j-1+temp_pos).setHorizontalAlignment("left");
                    // store calculated bar position in task table
                    input_sheet.getRange(i, 17).setValue(report_name);
                    input_sheet.getRange(i, 18).setValue(report_row);
                    input_sheet.getRange(i, 19).setValue(pos+j-1+temp_pos);
                  }
                  if (j == tmp_duration) {
                    // store calculated bar position in task table
                    input_sheet.getRange(i, 20).setValue(pos+j-1+temp_pos);
                  }
                }
              }
            }
            j = j +1
          }
          
          
        }
      }   
  }
  
  
  
  // 3. round: Labelling
  var row_switch = 0;
  for (var i = 0; i <= 50; i++) {
     var tmp_ticketnr = report_sheet.getRange(report_row, xOffset+i).getValue(); 
     if (tmp_ticketnr) {
        for (var j = 2; j <= input_sheet_rows; j++) {
            if (input_sheet.getRange(j, 16).getValue() == tmp_ticketnr) {
              
              report_sheet.getRange(report_row+1+row_switch, xOffset+i).setValue(input_sheet.getRange(j, 6).getValue());
              row_switch = (row_switch + 1) % 3
              break;
            }
        }
        
     }
  }
  
  
}


