
(function() {

  var serviceModule = angular.module('modal.service', []);

  /**
   *
   * 业务模块Modal管理类
   *
   * ionicModal.productSpecificsModal.open(parentScope, paramObj, config).then();
   *
   * config: {
     *     animation: , // The animation to show & hide with. Default: 'slide-in-right'
     *     focusFirstInput: , // Whether to autofocus the first input of the modal when shown. Default: false.
     *     backdropClickToClose: , // Whether to close the modal on clicking the backdrop. Default: true.
     *     hardwareBackButtonClose: // Whether the modal can be closed using the hardware back button on Android and similar devices. Default: true.
     * }
   *
   */
  serviceModule.factory('ionicModal', ['$ionicModal', '$q', 'appConstants', function($ionicModal, $q, appConstants) {

    // 所有业务modal在这里声明
    var serviceInstance =  {
      loginModal: genModal('templates/login.html'),
    };

    function genModal(templateUrl) {

      var _scope = null;
      var result;

      return {
        open: function(parentScope, paramObj, config) {

          if (!parentScope) {
            alert('parentScope is required!');
            return;
          }

          var deferred = $q.defer();
          var rootScope = parentScope.$root;

          config = config || {
              animation: 'slide-in-right'
            };

          _scope = parentScope.$new(true); // 通过独立的scope把参数传进去，不污染父scope
          _scope = _.extend(_scope, paramObj, {
            $close: function(data) {
              result = data;
              return _scope.modal.hide();
            }
          });

          $ionicModal.fromTemplateUrl(templateUrl, {
            scope: _scope,
            animation: config.animation || 'slide-in-up',
            backdropClickToClose: _.isUndefined(config.backdropClickToClose) ? true : config.backdropClickToClose
          }).then(function(modal) {
            _scope.modal = modal;
            _scope.modal.show();

            _scope.$on('modal.shown', function(data) {
              var modalCtrlName = data.targetScope.modal.modalEl.attributes['ng-controller'].value;
              rootScope.viewStartTime[modalCtrlName] = new Date().getTime();
            });

            _scope.$on('modal.hidden', function() {
              if (_scope.$id == arguments[0].targetScope.$id) {
                deferred.resolve(result);
                result = null;
                _scope.$destroy();
              }
            });

            _scope.$on('$destroy', function(data) {
              var modalCtrlName = data.targetScope.modal.modalEl.attributes['ng-controller'].value;

              var duration = new Date().getTime() - rootScope.viewStartTime[modalCtrlName];
              delete rootScope.viewStartTime[modalCtrlName];
              rootScope.remoteLog(appConstants.remoteLoggerInfo.pageView.title,  modalCtrlName, {duration: duration, durationStr: (duration / 1000).toFixed() + ' s'});

              _scope.modal.remove();
            });
          });

          return deferred.promise;

        }

      }

    }

    return serviceInstance;

  }]);

})();

