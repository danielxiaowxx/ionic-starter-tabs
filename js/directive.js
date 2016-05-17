
angular.module('app.directive', [])

/**
 * 当宽度自适应时始终显示正方形，即高度一直等于宽度
 */
  .directive('square', ['$window', function($window) {
    var directive = {
      restrict: 'A',
      link    : function(scope, element, attrs) {
        var style = window.getComputedStyle(element[0], null);
        var width = parseInt(style.width);
        element.css('height', width + 'px');
      }
    };

    return directive;
  }])

  .directive('showTabs', [function() {
    var directive = {
      restrict: 'A',
      link    : function(scope, element, attrs) {
        var tabsElem = angular.element(element.children()[0]);
        attrs.$observe('showTabs', function(newVal) {
          if (newVal === undefined) return;

          if (newVal && newVal == 'true')
            tabsElem.removeClass('hide');
          else
            tabsElem.addClass('hide');
        });
      }
    };
    return directive;
  }])

  .directive('viewAllPhotosInContent', ['$compile', 'ionicModal', function($compile, ionicModal) {
    var directive = {
      restrict: 'A',
      link    : function(scope, element, attrs) {

        scope.photos = [];

        scope.openImageViewer = function(idx) {
          ionicModal.productImagesViewerModal.open(scope, {
            param_itemIdx: idx,
            param_photos : scope.photos
          });
        };

        attrs.$observe('viewAllPhotosInContent', function(content) {
          if (content) {
            var wrapper = angular.element('<div></div>');
            var content = angular.element(content);
            _.each(content.find('img'), function(imgItem, idx) {
              var srcVal = $(imgItem).attr('src');
              if (scope.photos.indexOf(srcVal) >= 0) {
                $(imgItem).remove();
              } else {
                scope.photos.push(srcVal);
                imgItem.setAttribute('ng-click', 'openImageViewer(' + idx + ')');
                $(imgItem).attr('image-lazy-src', $(imgItem).attr('src') + '_q80.jpg'); // 80的质量
                $(imgItem).attr('src', 'img/banner-placeholder.jpg');
              }
            });
            _.each(content.find('a'), function(aItem) {
              $(aItem).attr('href', '');
            });
            wrapper.append(content);
            element.html(wrapper.html());
            $compile(element.contents())(scope);
          }
        })
      }
    };

    return directive;
  }]);

/**
 * ionRadioFix - fixes a bug in iOS 9 UIWebView that breaks the tilde selector in CSS. To
 * use this fix, include it after your Ionic bundle JS.
 *
 * Note: due to Angular directive override limitations, you'll need to change any reference
 * to <ion-radio> to <ion-radio-fix> to apply this patched radio button.
 *
 * Also, make sure to add the new CSS from the second part of this gist.
 */
angular.module('ionic').directive('ionRadioFix', function() {
  return {
    restrict  : 'E',
    replace   : true,
    require   : '?ngModel',
    transclude: true,
    template  : '<label class="item item-radio">' +
    '<input type="radio" name="radio-group">' +
    '<div class="radio-content">' +
    '<div class="item-content disable-pointer-events" ng-transclude></div>' +
    '<i class="radio-icon disable-pointer-events icon ion-checkmark"></i>' +
    '</div>' +
    '</label>',

    compile: function(element, attr) {
      if (attr.icon) {
        var iconElm = element.find('i');
        iconElm.removeClass('ion-checkmark').addClass(attr.icon);
      }

      var input = element.find('input');
      angular.forEach({
        'name'       : attr.name,
        'value'      : attr.value,
        'disabled'   : attr.disabled,
        'ng-value'   : attr.ngValue,
        'ng-model'   : attr.ngModel,
        'ng-disabled': attr.ngDisabled,
        'ng-change'  : attr.ngChange,
        'ng-required': attr.ngRequired,
        'required'   : attr.required
      }, function(value, name) {
        if (angular.isDefined(value)) {
          input.attr(name, value);
        }
      });

      return function(scope, element, attr) {
        scope.getValue = function() {
          return scope.ngValue || attr.value;
        };
      };
    }
  };
});

