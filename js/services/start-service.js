
angular.module('app.services')

  .factory('startService', ['$rootScope', '$q', '$cordovaGlobalization', '$ionicPlatform', 'localStoreService', 'appConstants', 'appGlobalVal', 'ionicModal', 'daoService', 'restService',

    function($rootScope, $q, $cordovaGlobalization, $ionicPlatform, localStoreService, appConstants, appGlobalVal, ionicModal, daoService, restService) {

      return {
        appStart: function() {
          _init();
        }
      };

      function _init() {

        daoService.initData();

        appGlobalVal.settings = localStoreService.get(appConstants.localStorage.settings.key);

        if (!appGlobalVal.settings) {
          //getDefaultLanguage().then(function(language) {

          var language = appConstants.languages[0]; // TODO Daniel: 浏览器调度用，正式注释换成上面的

          $rootScope.i18n = window[language.key];

          appGlobalVal.settings = { // 默认设置
            language  : language
          };

          localStoreService.set(appConstants.localStorage.settings.key, appGlobalVal.settings);

          //});
        } else {

          $rootScope.i18n = window[appGlobalVal.settings.language.key];

        }

        // 当APP启动的时候才上传错误日志
        uploadErrorMsgs();
      }

      function uploadErrorMsgs() {

        var sendToRemote = function(data) {

          var deferred = $q.defer();

          var xmlhttp = new XMLHttpRequest();

          xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4) {
              if (xmlhttp.status === 200) {
                var ids = _.map(data, function(item) { return item.body.id; });
                daoService.updateErrorMsgsSyncStatus(ids);
              }
              deferred.resolve();
            }
          };
          xmlhttp.open("POST", 'https://api.bmob.cn/1/batch', true);
          xmlhttp.setRequestHeader("X-Bmob-Application-Id", "06d272626242cdd17c255ed6d249cb42"); // TODO
          xmlhttp.setRequestHeader("X-Bmob-REST-API-Key", "e0127ccf24f1d03f292e1d9fd0e2c95a"); // TODO
          xmlhttp.setRequestHeader("Content-Type", "application/json");
          xmlhttp.send(JSON.stringify({
            "requests": data
          }));

          return deferred.promise;
        };

        daoService.getUnSyncErrorMsgs().then(function(data) {
          var dataList = _.chain(data).chunk(20).map(function(dataItem) {
            return _.map(dataItem, function(item) {
              return {
                "method": "POST",
                "path"  : "/1/classes/error_msg",
                "body"  : item
              }
            })
          }).value();

          dataList.reduce(function(chain, errorData) {
            return chain.then(function() {
              return sendToRemote(errorData);
            })
          }, $q.resolve());
        });
      }

      function getDefaultLanguage() {
        var language = appConstants.languages[0];
        return $q(function(resolve) {
          $cordovaGlobalization.getPreferredLanguage().then(
            function(result) {
              var lang = result.value; // zh-CN  zh-TW  en-US
              switch (lang) {
                case 'zh-CN':
                  language = appConstants.languages[0]; // 简体
                  break;
                case 'zh-TW':
                  language = appConstants.languages[1]; // 繁体
                  break;
                default: // 其它都是英文
                  language = appConstants.languages[2]; // 英文
              }
              resolve(language);
            }
          ).catch(function() {
              resolve(language);
            });
        });

      }

    }]);
