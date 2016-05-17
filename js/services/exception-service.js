
(function() {

  var services = angular.module('app.exception-service', []);

  // The "stacktrace" library that we included in the Scripts
  // is now in the Global scope; but, we don't want to reference
  // global objects inside the AngularJS components - that's
  // not how AngularJS rolls; as such, we want to wrap the
  // stacktrace feature in a proper AngularJS service that
  // formally exposes the print method.
  services.factory('stacktraceService', function() {
    return ({
      print: printStackTrace
    });
  });

  // By default, AngularJS will catch errors and log them to
  // the Console. We want to keep that behavior; however, we
  // want to intercept it so that we can also log the errors
  // to the server for later analysis.
  services.provider("$exceptionHandler", {
    $get: ['errorLogService', function(errorLogService) {
      return errorLogService;
    }]
  });


  // The error log service is our wrapper around the core error
  // handling ability of AngularJS. Notice that we pass off to
  // the native "$log" method and then handle our additional
  // server-side logging.
  services.factory('errorLogService', ['$log', '$window', 'stacktraceService', function($log, $window, stacktraceService) {

    function log(exception, cause) {
      // Pass off the error to the default error handler
      // on the AngualrJS logger. This will output the
      // error to the console (and let the application
      // keep running normally for the user).
      $log.error.apply($log, arguments);

      var errorMessage = exception;
      var stackTrace = stacktraceService.print({e: exception});

      var logData = {
        "errorUrl"    : $window.location.href.replace(/.*?#/, ''),
        "errorMessage": errorMessage.message,
        "stackTrace"  : stackTrace.join('\n')
      };

      // 因为这里依赖$rootScope会导致循环依赖，所以把$rootScope赋值于window.$rootScope，并通过事件处理
      window.$rootScope.$emit('recordErrorLog', logData);

    }

    return (log);
  }]);
})();
