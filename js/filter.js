/**
 * Created by danielxiao on 15/9/12.
 */

angular.module('pocket-fkc-app.filter', [])

  .filter('template', [function() {

    return function(input, valObj) {
      valObj = _.isObject(valObj) ? valObj : JSON.parse(valObj);
      return _.template(input)(valObj);
    }

  }]);
