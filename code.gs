function test() {
  var now = new Date();
  //mydate = Utilities.formatDate(now, 'Europe/Berlin', 'MMMM dd, yyyy HH:mm:ss Z')
  mydate = Utilities.formatDate(now, 'Europe/Berlin', 'dd.MM.')
  Browser.msgBox('Hello', 'Datum: ' + mydate, Browser.Buttons.YES_NO)
  url = ScriptApp.getService().getUrl()
  Logger.log(url)
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



function parseMail(fullMailBody) {
  // https://regex101.com 
  // https://developer.mozilla.org/de/docs/Web/JavaScript/Guide/Regular_Expressions

  // Shorten full mail text to last mail reply ('von/from/...' at line beginning as separator)
  var regEx_LastMail = new RegExp("((.|\r|\n)*?)^(von:|Von:|from:|From:|Betreff:|Subject:|subject)", "gm"); 
  var LastMail = regEx_LastMail.exec(fullMailBody)[1].trim();  // first regex-Group match, leading/trailing spaces removed
  
  LastMail = 'what industry group:IT "hier text dazwischen" Test Label:test, employees number:10000 / limit:500,00,Turnover=1.000.000\ntest:test';
    
  // Step 1
  // Extract value pairs, separated by : or =
  var regEx_Data1 = new RegExp("(([a-zA-Z ]+)[\:=]([a-zA-Z]+|([0-9,.]+)))", "gm"); 
  var Data1 = LastMail.match(regEx_Data1)
  
  // Step 2
  // Loop through value pairs, split, clean
  var Data2 =[]
  for (var i in Data1) {
    // replace = delimiter by : and tremove leading/trailing spaces
    var tmp = Data1[i].replace(/=/g, ':').trim(); 
    // split by :
    var tmp_split = tmp.split(':') 
    var tmp_obj = {};
    tmp_obj['label'] = tmp_split[0];
    tmp_obj['value'] = tmp_split[1];
    Data2.push(tmp_obj);
  }
  
  // TODO
  //  [0-9]{1,3}([,\s.'][0-9]{3})*|[0-9]+)([.,][0-9]+)? # Number (incl punctuation)
  

  var debug = true
}


// TEST FUNCTIONS

// OFFLINE
function testParseMail2() {
  var mail = {"subject":"WG: WG: Test","from":"NN <nn@abc.com>","body":"zeile 1\r\nzeile 2\r\n\r\nVon: abc@abc.com [mailto:abc@abc.com]\r\nGesendet: Montag, 7. Januar 2019 20:47\r\nAn: N.N.\r\nBetreff: Aw: WG: Test\r\n\r\nReply von web.de\r\nZeile 2\r\n\r\nGesendet: Montag, 07. Januar 2019 um 20:45 Uhr\r\nVon: \"N.N.\" <nn@abc.com<mailto:nn@abc.com>>\r\nAn: \"abc@abc.com<mailto:abc@abc.com>\" <abc@abc.com<mailto:abc@abc.com>>\r\nBetreff: WG: Test\r\n\r\n\r\nVon: N.N. [mailto:knipschild@googlemail.com]\r\nGesendet: Montag, 7. Januar 2019 20:43\r\nAn: N.N.\r\nBetreff: Re: Test\r\n\r\nReply 3 (von Gmail)\r\nZeile 2\r\n\r\nAm Mo., 7. Jan. 2019 um 20:41 Uhr schrieb NN <nn@abc.com<mailto:nn@abc.com>>:\r\nBody 1\r\nBody 2\r\n\r\nVon: N.N.\r\nGesendet: Montag, 7. Januar 2019 20:42\r\nAn: N.N.\r\nBetreff: AW: Test\r\n\r\nReply 1\r\nZeile 2\r\n\r\nVon: N.N.\r\nGesendet: Montag, 7. Januar 2019 20:42\r\nAn: N.N.\r\nBetreff: Test\r\n\r\nBody 1\r\nBody 2\r\n","type":"get"}
  var fullMailBody = mail.body;
  
  parseMail(fullMailBody);
}

// ONLINE
function testParseMail1() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var log_sheet = spreadsheet.getSheetByName("log");
  var mail = JSON.parse(log_sheet.getRange(8, 3).getValue());  
  var fullMailBody = mail.body;

  var fullMailBody_64 = 'emVpbGUgMQp6ZWlsZSAyCgpWb246IGFrbmlwQHdlYi5kZSBbbWFpbHRvOmFrbmlwQHdlYi5kZV0KR2VzZW5kZXQ6IE1vbnRhZywgNy4gSmFudWFyIDIwMTkgMjA6NDcKQW46IEFuc2dhciBLbmlwc2NoaWxkCkJldHJlZmY6IEF3OiBXRzogVGVzdAoKUmVwbHkgdm9uIHdlYi5kZQpaZWlsZSAyCgpHZXNlbmRldDogTW9udGFnLCAwNy4gSmFudWFyIDIwMTkgdW0gMjA6NDUgVWhyClZvbjogIkFuc2dhciBLbmlwc2NoaWxkIiA8QW5zZ2FyLktuaXBzY2hpbGRAbWdtLXRwLmNvbTxtYWlsdG86QW5zZ2FyLktuaXBzY2hpbGRAbWdtLXRwLmNvbT4+CkFuOiAiYWtuaXBAd2ViLmRlPG1haWx0bzpha25pcEB3ZWIuZGU+IiA8YWtuaXBAd2ViLmRlPG1haWx0bzpha25pcEB3ZWIuZGU+PgpCZXRyZWZmOiBXRzogVGVzdAoKClZvbjogQW5zZ2FyIEtuaXBzY2hpbGQgW21haWx0bzprbmlwc2NoaWxkQGdvb2dsZW1haWwuY29tXQpHZXNlbmRldDogTW9udGFnLCA3LiBKYW51YXIgMjAxOSAyMDo0MwpBbjogQW5zZ2FyIEtuaXBzY2hpbGQKQmV0cmVmZjogUmU6IFRlc3QKClJlcGx5IDMgKHZvbiBHbWFpbCkKWmVpbGUgMgoKQW0gTW8uLCA3LiBKYW4uIDIwMTkgdW0gMjA6NDEgVWhyIHNjaHJpZWIgQW5zZ2FyIEtuaXBzY2hpbGQgPEFuc2dhci5Lbmlwc2NoaWxkQG1nbS10cC5jb208bWFpbHRvOkFuc2dhci5Lbmlwc2NoaWxkQG1nbS10cC5jb20+PjoKQm9keSAxCkJvZHkgMgoKVm9uOiBBbnNnYXIgS25pcHNjaGlsZApHZXNlbmRldDogTW9udGFnLCA3LiBKYW51YXIgMjAxOSAyMDo0MgpBbjogQW5zZ2FyIEtuaXBzY2hpbGQKQmV0cmVmZjogQVc6IFRlc3QKClJlcGx5IDEKWmVpbGUgMgoKVm9uOiBBbnNnYXIgS25pcHNjaGlsZApHZXNlbmRldDogTW9udGFnLCA3LiBKYW51YXIgMjAxOSAyMDo0MgpBbjogQW5zZ2FyIEtuaXBzY2hpbGQKQmV0cmVmZjogVGVzdAoKQm9keSAxCkJvZHkgMgo='
  var fullMailBody_64_LZW = 'emVpbGUgMQp6ZWlsZSAyCgpWb246IGFrbmlwQHdlYi5kĐBbbWFăHRvOmĞĠĢĤĦĨĪZV0KR2VzČľXQěE1vbnRhZywgNy4gSķudİyIDIwMTkćjA6NDcKQWĚIEFuc2dhciBLĹwŷNoaWxkCkJldHƊZmYŋF3OżXRzogVGŅdAoKUāwbHŧdm9uIĥħĩīĉaČĎĐĒĔpHZXNlĠRƋDƚTWƫdĝnLCAwŗřśŵŞFŠŢŤŦgŞ0ŨŪŬĆVWhēlZŎjƚIkŵŷŹŻŽſƁƃƅkIiA8Ű5ņ2ǓLktuaXBzY2hăGRAįdtLƗwLmNŎTxtYčsǇ86ǸǺǼǾȀȂȄȆȈȊȌȎȐȒȔbT4+ƈŵƕAișǿȁBAdńiȒǀPG1hƄx0bzpɄ25pcEB3ČIuZą+ǴǶȷȣȺȼVȾmɀɂɄƅɇɉɋɍɏɑɓɕɗPĕCƻRyČƏƕBƗƙƛƝzƟơCǣǥƚȟZǻŠEȸȤȅȇĄQgW2ɃɅɦpğġƀ2ƂɅkQGdŎŸďWʒWwuȅ9tŉƹƻƽƿǁǃǅŝǈǊA3LżKș51YXIǛxOđyMǂ0MwpĭǦgʄʆųʉȃʋȈQůā0cāmZˍƣUěFǀc3˖ʀƊcGx5šMgKƺŎżHįıbƈKWāȈĆˮơŰǚǄ8uʵʷʹș4ƬǕťƨWǚMũūDEƛǠŠHNjaƍpɓˎWǹʅǓˑɜȥʌGʎPŴŶŸźĩžʗǰʛʝ1nbS1˙C5jĘ08˵ĲĴOǩ̬Ǭ̯ǯʙǱƆ̴̶̸̺̼̾+PǦ˗9keđxƈJvZƧćgơVƪuɷĭnNnʾˀSɌɎ̘̚GƵAʬƼƾɡʰgǄǆʴǋ̆Bʺ̠ʽʿˁ˃Ēˆoˈĕˌʃ̠Ƞʇ˒̦˕˗ŀ˚ͤ˝ʃVcˡˣ˥K˧l˩˫šE˹˻Ą˽͢KͤƫͧŏͪͬŚͯcͱaͳď͵ƺͷʯdǂͻʲǇFǉͿʸ΁ʻ΄ˀ̐A˂˄Ή΋ˋbˍˏ̣ʈ̥˔ʍΕ˙˛ΙɻƞƠ͖͚͘͜͞͠˾=' 
  //fullMailBody = Base64.decode(LZWdecode(fullMailBody_64_LZW))
  
  parseMail(fullMailBody);
}

