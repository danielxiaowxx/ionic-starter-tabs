// Ionic Starter App

/**
 * 这样可以确保设备ready，才启用device相关功能
 */
ionic.Platform.ready(function() {

  angular.bootstrap(document, ['app']);

});

/**
 *  This patch works around iOS9 UIWebView regression that causes infinite digest
 *  errors in Angular.
 */
angular.module('ngIOS9UIWebViewPatch', ['ng']).config(['$provide', function($provide) {
  'use strict';

  $provide.decorator('$browser', ['$delegate', '$window', function($delegate, $window) {

    if (isIOS9UIWebView($window.navigator.userAgent)) {
      return applyIOS9Shim($delegate);
    }

    return $delegate;

    function isIOS9UIWebView(userAgent) {
      return /(iPhone|iPad|iPod).* OS 9_\d/.test(userAgent) && !/Version\/9\./.test(userAgent);
    }

    function applyIOS9Shim(browser) {
      var pendingLocationUrl = null;
      var originalUrlFn = browser.url;

      browser.url = function() {
        if (arguments.length) {
          pendingLocationUrl = arguments[0];
          return originalUrlFn.apply(browser, arguments);
        }

        return pendingLocationUrl || originalUrlFn.apply(browser, arguments);
      };

      window.addEventListener('popstate', clearPendingLocationUrl, false);
      window.addEventListener('hashchange', clearPendingLocationUrl, false);

      function clearPendingLocationUrl() {
        pendingLocationUrl = null;
      }

      return browser;
    }
  }]);
}]);

angular.module('app', ['ionic', 'ngCordova', 'LocalStorageModule', 'angular-md5', 'ngIOS9UIWebViewPatch', 'jett.ionic.scroll.sista', 'ionicLazyLoad', 'common.service', 'modal.service', 'app.directive', 'app.filter', 'app.controllers', 'app.services', 'app.rest-services', 'app.exception-service'])

  .constant('appConstants', {
    appVersion      : '1.0.0',
    languages       : [
      {
        id     : 1,
        display: '简体中文',
        key    : 'i18n_zh_cn'
      },
      {
        id     : 2,
        display: '繁體中文',
        key    : 'i18n_zh_hk'
      },
      {
        id     : 3,
        display: 'English',
        key    : 'i18n_en'
      }
    ],
    // 本地存储键值及设置
    localStorage    : {
      settings  : {
        key: 'settings'
      },
      userInfo  : {
        key: 'userInfo'
      }
    },
    // 触发动作
    triggerAction   : {
    },
    // 远程日志
    remoteLoggerInfo: {
      pageView: { // 功能访问
        title: 'Page View'
      },
      action  : { // 动作
        title: 'Action'
      }
    }
  })

/**
 * 全局变量
 */
  .value('appGlobalVal', {
    settings: {},
    userInfo: {}
  })

  .run(['$ionicPlatform', '$rootScope', '$location', 'ionicModal', 'startService', function($ionicPlatform, $rootScope, $location, ionicModal, startService) {

    //  两个方法一定要放在这里，否则startService.appStart()里面的方法会报错
    $rootScope.registerPasswordProtectionEvent = function() {
      $rootScope.cancelPasswordProtectionAction = $ionicPlatform.on('resume', function() {
        //console.log('resume');
        if ($rootScope.tempSwitchApp()) {
          $rootScope.tempSwitchApp(0);
          return;
        }
        ionicModal.loginModal.open($rootScope, {
          param_mode: 'login'
        }, {animation: 'slide-in-up', backdropClickToClose: false});
      });
    };
    $rootScope.unregisterPasswordProtectionEvent = function() {
      $rootScope.cancelPasswordProtectionAction && $rootScope.cancelPasswordProtectionAction();
    };

    startService.appStart();

    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true); // 注释掉避免IOS下拉框值没有DONE按钮
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleLightContent();
      }
    });
  }])

  .config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', '$compileProvider', 'localStorageServiceProvider', 'remoteLoggerProvider',

    function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $compileProvider, localStorageServiceProvider, remoteLoggerProvider) {

      $ionicConfigProvider.backButton.text('');
      $ionicConfigProvider.backButton.previousTitleText('');
      $ionicConfigProvider.tabs.position('bottom');
      $ionicConfigProvider.navBar.alignTitle('center');

      remoteLoggerProvider.setTimeout(60 * 30);
      remoteLoggerProvider.setMaxLength(5);

      $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|content):/);

      localStorageServiceProvider.setPrefix('app');

      // Ionic uses AngularUI Router which uses the concept of states
      // Learn more here: https://github.com/angular-ui/ui-router
      // Set up the various states which the app can be in.
      // Each state's controller can be found in controllers.js
      $stateProvider

        // setup an abstract state for the tabs directive
        .state('tab', {
          url        : '/tab',
          abstract   : true,
          templateUrl: 'templates/tabs.html'
        })

        // Each tab has its own nav history stack:

        .state('tab.home', {
          url  : '/home',
          views: {
            'tab-home': {
              templateUrl: 'templates/tab-home.html',
              controller : 'HomeCtrl'
            }
          }
        })

        .state('tab.setting', {
          url  : '/setting',
          views: {
            'tab-setting': {
              templateUrl: 'templates/tab-setting.html',
              controller : 'SettingCtrl'
            }
          }
        })

        .state('tab.setting-about', {
          url   : '/setting/about',
          views : {
            'tab-setting': {
              templateUrl: 'templates/setting-about.html'
            }
          },
          params: {
            fullScreen: true
          }
        })

      ;

      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/tab/home');

    }]);
