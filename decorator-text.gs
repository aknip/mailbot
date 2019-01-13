// https://www.sitepoint.com/javascript-decorators-what-they-are/


function doSomething(name) {
  Logger.log('Hello, ' + name);
}

function loggingDecorator(wrapped) {
  return function() {
    Logger.log('Starting');
    var result = wrapped.apply(this, arguments);
    Logger.log('Finished');
    return result;
  }
}

function decoratorTest() {
  var doSomethingLogged = loggingDecorator(doSomething);
  doSomething('Joe');
  doSomethingLogged('Joe');
}



