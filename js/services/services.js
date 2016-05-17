angular.module('app.services', [])

  .factory('daoService', ['$rootScope', '$cordovaSQLite', '$cordovaLocalNotification', '$q', 'appConstants',

    function($rootScope, $cordovaSQLite, $cordovaLocalNotification, $q, appConstants) {

      var db;

      var getDb = function() {

        if (db) return db;

        if (window.cordova) {
          db = $cordovaSQLite.openDB({name: "app.db", bgType: 1}); //TODO rename app.db device
        } else {
          db = window.openDatabase("app.db", '1', 'app', 1024 * 1024 * 100); //TODO rename app.db and app browser
        }
        return db;
      };

      return {

        initData: function() {
          var sqls = [
            "CREATE TABLE IF NOT EXISTS fkc_error_msg (id INTEGER PRIMARY KEY AUTOINCREMENT, errorUrl TEXT, errorMessage TEXT, stackTrace TEXT, hasSync INTEGER)"
          ];

          var promises = _.map(sqls, function(sql) {
            return $cordovaSQLite.execute(getDb(), sql);
          });

          return $q.all(promises);
        },

        getAllData: function(tableName) {
          var query = "SELECT * FROM " + tableName;
          return $cordovaSQLite.execute(getDb(), query).then(function(data) {
            var items = [];
            for (var i = 0, leng = data.rows.length; i < leng; i++) {
              var item = data.rows.item(i);
              items.push(item);
            }
            return items;
          });
        },

        removeAllData: function(tableName) {
          var query = "DELETE FROM " + tableName;
          return $cordovaSQLite.execute(getDb(), query);
        },

        addErrorMsg: function(errorMsgItem) {
          var id = genId();
          var sql = 'INSERT INTO fkc_error_msg VALUES (?, ?, ?, ?, ?)';
          return $cordovaSQLite.execute(getDb(), sql, [id, errorMsgItem.errorUrl || '', errorMsgItem.errorMessage || '', errorMsgItem.stackTrace || '', 0]).then(function() {
            return id;
          });
        },

        isErrorMsgExist: function(errorUrl, errorMessage) {
          var sql = 'SELECT COUNT(id) total FROM fkc_error_msg WHERE errorUrl=? AND errorMessage=?';
          return $cordovaSQLite.execute(getDb(), sql, [errorUrl, errorMessage]).then(function(data) {
            return data.rows.item(0).total > 0;
          });
        },

        getUnSyncErrorMsgs: function() {
          var sql = 'SELECT id, errorUrl, errorMessage, stackTrace FROM fkc_error_msg WHERE hasSync=0';
          return $cordovaSQLite.execute(getDb(), sql).then(function(data) {
            var items = [];
            for (var i = 0, leng = data.rows.length; i < leng; i++) {
              var item = data.rows.item(i);
              items.push(item);
            }
            return items;
          });
        },

        updateErrorMsgsSyncStatus: function(ids) {
          var sql = 'UPDATE fkc_error_msg SET hasSync=1 WHERE id in (' + ids.join(',') + ')';
          return $cordovaSQLite.execute(getDb(), sql);
        }
      };

      function genId() {
        return new Date().getTime();
      }

    }]);
