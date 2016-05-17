/**
 * User: Daniel
 */

(function() {

  var serviceModule = angular.module('common.service', []);

  serviceModule.factory('localStoreService', ['localStorageService', function(localStorageService) {

    var storeService = localStorageService;

    return {

      get: function(key) {
        return storeService.get(key);
      },

      set: function(key, value) {
        storeService.set(key, value);
      }

    }
  }]);

  /**
   * 拦截http response，统一进行错误处理
   */
  serviceModule.factory('httpInterceptor', ['$q', 'errorService',
    function httpInterceptor($q, errorService) {
      return {
        'request' : function(config) {
          return config;
        },
        'response': function(response) {
          response.data = response.data.result !== undefined ? response.data.result : response.data;
          return response;
        },

        'responseError': function(rejection) {
          errorService.setError(rejection.data ? rejection.data.message || rejection.data.code : "Request Timeout");
          return $q.reject(rejection);
        }
      };
    }
  ]);

  /**
   * 用于全局界面处理错误信息的服务
   */
  serviceModule.factory('errorService', [function errorService() {
    var serviceInstance = {
      errorMessage: null,
      setError    : function(msg) {
        this.errorMessage = msg;
      },
      clear       : function() {
        this.errorMessage = null;
      }
    };
    return serviceInstance;
  }]);

  /**
   * 工具类服务
   */
  serviceModule.factory('utilService', ['$http', function utilService($http) {
    var serviceInstance = {
      /**
       * 安全执行方法，会判断是否在生命周期内
       * @param $scope
       * @param fn
       */
      safeApply: function($scope, fn) {
        var phase = $scope.$root.$$phase;
        if (phase === '$apply' || phase === '$digest') {
          if (fn && (typeof(fn) === 'function')) {
            fn();
          }
        } else {
          $scope.$apply(fn);
        }
      },

      /**
       * 对service层的访问远程url的重复代码再封装。
       */
      httpPost: function(url, param, options) {
        return $http.post(url, param || {}, options);
      },

      /**
       * 对service层的访问远程url的重复代码再封装。
       */
      httpGet: function(url, param, options) {
        return $http.get(url, _.extend({params: param}, options));
      }
    };
    return serviceInstance;
  }]);

  /**
   * 远程日志工具
   */
  serviceModule.provider('remoteLogger', function remoteLogger() {

    var maxLength = 10;
    var timeout = 60 * 30 * 1000; // 默认半个钟发一次

    /**
     * 设置日志队列最大值，达到该值则传输到远程服务器
     * @param val
     */
    this.setMaxLength = function(val) {
      maxLength = val;
    };

    /**
     * 设置超时时间，到达这个时间日志队列未到达maxLength也传输到远程服务器
     * @param val 单位秒
     */
    this.setTimeout = function(val) {
      timeout = val * 1000;
    };

    function remoteLogger() {

      var interval, total = 0; // 这里只是简单的计数，total不一定跟本地真实的event数相同，因为会有网络不通的情况

      /**
       * 远程行为日志记录
       * @param title String 如“点击Banner广告”
       * @param message String 如“Banner广告位第一屏”
       * @param params Object 如 {“广告内容”：“电商双12大促“，“促销品价格”：”100~400RMB“，“广告素材类型”:”图片”}
       */
      this.log = function(title, message, params) {

        // 用talkingdata的用户行为统计分析服务
        TDAPP.onEvent(title, message, params);
        total++;

        if (total >= maxLength) {
          sendToRemote();
        }
      };

      function sendToRemote() {
        TDAPP.send();
        total = 0;

        resetTimeout();
      }

      function resetTimeout() {
        if (interval) clearTimeout(interval);
        interval = setTimeout(sendToRemote, timeout);
      }

      resetTimeout();

    }

    this.$get = [function() {
      return new remoteLogger();
    }];
  });

  /**
   * 实现点击Backdrop关闭Popup功能
   */
  serviceModule.factory('closePopupService', ['$document', '$ionicPopup', '$timeout', function($document, $ionicPopup, $timeout) {
    var lastPopup;
    return {
      register: function(popup) {
        $timeout(function() {
          var element = $ionicPopup._popupStack.length > 0 ? $ionicPopup._popupStack[0].element : null;
          if (!element || !popup || !popup.close) return;
          element = element && element.children ? angular.element(element.children()[0]) : null;
          lastPopup = popup;
          var insideClickHandler = function(event) {
            event.stopPropagation();
          };
          var outsideHandler = function() {
            popup.close();
          };
          element.on('click', insideClickHandler);
          $document.on('click', outsideHandler);
          popup.then(function() {
            lastPopup = null;
            element.off('click', insideClickHandler);
            $document.off('click', outsideHandler);
          });
        });
      },

      closeActivePopup: function() {
        if (lastPopup) {
          $timeout(lastPopup.close);
          return lastPopup;
        }
      }
    };
  }])

})();
