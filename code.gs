
// TODOS
// intent catalog aus Google Sheets ziehen


//
// DEV-TEST STARTER
//
function devTest() {
   
  context().log(context(), 'DEV', 'Start DEV Logging')
  var mail = {'subject':'Test 1','from':'user1 <user1@abc.com>','body':'I want an D & O Offer\r\nName: ABC, Umsatz: 2500000','type':'get'};
  var mail_data = parseMailBody(context(), mail.body);  
  context().log(context(), 'DEV', JSON.stringify(mail_data));
  
  // do quick unit test, disable via 'xcheck'
  var test = tyrionTestRunner(context());
  test.xcheck('Test 1: Mailparser D&O offer, 4 data points', function () {
    var expected_data = {"intent":{"action":"create offer","parameter":"d&o"},"data":[{"label":"Name","value":"ABC"},{"label":"Turnover","value":"2500000"}]};
    test.expect.deeplyEqual(mail_data, expected_data);
  });

}


function parseMailBody(context, fullMailBody) {
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
  var want = "(want|möchte|hätte gerne|.*)";
  var d_o = "(hpdo|d&o|d & o)";
  var cyber = "(hpcy|cyber)";
  var offer = "(offer|angebot)";
  
  var intent_catalog = [
    {
      intent: {action: 'create offer', parameter: 'cyber'},
      searches: [
        want+"(?=.*"+offer+")(?=.*"+cyber+")",
        want+"(?=.*"+cyber+")(?=.*"+offer+")"
      ]
    },
    {
      intent: {action: 'create offer', parameter: 'd&o'},
      searches: [
        want+"(?=.*"+offer+")(?=.*"+d_o+")",
        want+"(?=.*"+d_o+")(?=.*"+offer+")"
      ]
    }
  ]
  
  var label_catalog = [
    {
      label: 'Turnover',
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
  var regEx_Data1 = /([a-zA-Z ]+)[\:=]\s*([a-zA-Z]+|([0-9,.]+))/gm;
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
    
    // check for double comma and remove it: eg. 500,90,
    // data_value = data_value.replace(/(.*),$/g, "$1");
    data_value = data_value.replace(/(\d+,\d+),/g, "$1");
    
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
    'data': Data2
    }
    
  //context.log(context, 'Log out of parser-function ', JSON.stringify(Data2))  

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


