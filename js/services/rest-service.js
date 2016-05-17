/**
 * Created by danielxiao on 15/9/28.
 */

angular.module('app.rest-services', [])

  .factory('restService', ['$q', 'md5', 'localStoreService', 'daoService', 'appConstants', 'appGlobalVal', 'utilService',

    function($q, md5, localStoreService, daoService, appConstants, appGlobalVal, utilService) {

      var serviceInstance = {

      };

      return serviceInstance;

    }]);
