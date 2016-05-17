angular.module('app.controllers', [])

  .controller('AppCtrl', ['$scope', '$rootScope', '$ionicPopup', '$ionicLoading', '$cordovaInAppBrowser', '$cordovaNetwork', 'appConstants', 'remoteLogger', 'daoService',

    function($scope, $rootScope, $ionicPopup, $ionicLoading, $cordovaInAppBrowser, $cordovaNetwork, appConstants, remoteLogger, daoService) {

      window.$rootScope = $rootScope;

      var platform = ionic.Platform.isIOS() ? 'ios' : 'android';
      var lastOpenParams = {
        url: '',
        data:  {}
      };

      /*========== Scope Models ==================================================*/

      $rootScope.viewStartTime = {}; // 用于记录访问各个模块的开始时间

      $rootScope.showTabs = true;

      $rootScope.imgPlaceholderUrl = 'img/img-placeholder-90x90.png';
      $rootScope.bannerPlaceholderUrl = 'img/banner-placeholder.jpg';

      /*========== Scope Functions ==================================================*/

      /**
       * 记录远程日志
       * @param title
       * @param message
       * @param params
       */
      $rootScope.remoteLog = function(title, message, params) {
        remoteLogger.log(title, message, params);
      };

      /**
       * （供子scope共用）
       * @param title
       * @param message
       */
      $rootScope.alert = function(message, title) {
        return $ionicPopup.alert({
          title   : title,
          template: message,
          okText  : $rootScope.i18n.ok
        });
      };

      /**
       * （供子scope共用）
       * @param title
       * @param message
       */
      $rootScope.confirm = function(message, title) {
        return $ionicPopup.confirm({
          title     : title || $rootScope.i18n.confirm,
          template  : message,
          okText    : $rootScope.i18n.ok,
          cancelText: $rootScope.i18n.cancel
        });
      };

      $rootScope.loading = function(isShow, msg) {
        if (isShow) {
          $ionicLoading.show({
            template: msg || $rootScope.i18n.loading
          });
        } else {
          $ionicLoading.hide();
        }
      };

      /**
       * 记录临时切换app，如打开联系人，相册等本地app时
       * @param status 1-start 0-end
       */
      var switchStatus = 0;
      $rootScope.tempSwitchApp = function(status) {
        if (status === undefined) { // get
          return switchStatus;
        } else { // set
          var isAndroid = ionic.Platform.isAndroid();
          // android才需要记录，因为临时切换再切回来会触发resume事件
          if (isAndroid) switchStatus = status;
        }
      };

      $rootScope.openBrowser = function(url, data) {

        lastOpenParams.url = url;
        lastOpenParams.data = data;

        if ($cordovaNetwork.isOffline()) {
          $rootScope.alert($rootScope.i18n.connectFail);
          return;
        }

        $rootScope.loading(true);

        var options = {
          location: 'no',
          toolbar: 'yes',
          clearcache: 'no',
          clearsessioncache: 'no',
          hidden: 'yes',
          // ios
          enableViewportScale: 'yes',
          closebuttoncaption: '关闭'
        };
        if (platform == 'android') {
          options.location = 'yes';
        }

        $cordovaInAppBrowser.open(url, '_blank', options);

        if (url.search('taobao://') >= 0) {
          $rootScope.loading(false);
        }

        var logTitle = _.get(data, 'logTitle', '');
        if (logTitle) {
          $rootScope.remoteLog(appConstants.remoteLoggerInfo.pageView.title, logTitle);
        }
      };

      /*========== Listeners ==================================================*/

      $rootScope.$on('recordErrorLog', function(event, logData) {
        daoService.isErrorMsgExist(logData.errorUrl, logData.errorMessage).then(function(exist) {
          if (!exist) {
           daoService.addErrorMsg(logData);
          }
        });
      });

      $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        $rootScope.showTabs = !toParams.fullScreen;
      });

      // 记录View的访问日志
      $scope.$on('$ionicView.enter', function() {
        var data = arguments[1];
        if (data.viewId) {
          $rootScope.viewStartTime[data.stateName] = new Date().getTime();
        }
      });
      $scope.$on('$ionicView.leave', function() {
        var data = arguments[1];
        if (data.viewId) {
          var duration = new Date().getTime() - $rootScope.viewStartTime[data.stateName];
          delete $rootScope.viewStartTime[data.stateName];
          $rootScope.remoteLog(appConstants.remoteLoggerInfo.pageView.title, data.stateName, {duration: duration, durationStr: (duration / 1000).toFixed() + ' s'});
        }
      });

      $rootScope.$on('$cordovaInAppBrowser:loadstop', function(){
        $rootScope.loading(false);
        $cordovaInAppBrowser.show();
        // insert CSS via code / file
        $cordovaInAppBrowser.insertCSS({
          code: '.mui-sb-box {display:none} #content.pt85 {padding-top: 42px} #inner-back {display: none} div[class$=dsk] {display:none !important} body {padding-top:0}'
        });

      });

      $rootScope.$on('$cordovaInAppBrowser:loaderror', function() {
        $rootScope.loading(false);
        if (platform === 'ios' && lastOpenParams.url.search('taobao://') >= 0) {
          var url = lastOpenParams.url.replace('taobao://', 'http://');
          $rootScope.openBrowser(url, lastOpenParams.data);
        }
      });

      /*========== Watches ==================================================*/

      /*========== Private Functions ==================================================*/


    }])
;
