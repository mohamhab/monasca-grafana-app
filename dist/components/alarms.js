'use strict';

System.register(['app/core/config', 'app/core/app_events', './monasca_client'], function (_export, _context) {
  "use strict";

  var config, appEvents, MonascaClient, _slicedToArray, _createClass, AlarmsPageCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_appCoreConfig) {
      config = _appCoreConfig.default;
    }, function (_appCoreApp_events) {
      appEvents = _appCoreApp_events.default;
    }, function (_monasca_client) {
      MonascaClient = _monasca_client.default;
    }],
    execute: function () {
      _slicedToArray = function () {
        function sliceIterator(arr, i) {
          var _arr = [];
          var _n = true;
          var _d = false;
          var _e = undefined;

          try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
              _arr.push(_s.value);

              if (i && _arr.length === i) break;
            }
          } catch (err) {
            _d = true;
            _e = err;
          } finally {
            try {
              if (!_n && _i["return"]) _i["return"]();
            } finally {
              if (_d) throw _e;
            }
          }

          return _arr;
        }

        return function (arr, i) {
          if (Array.isArray(arr)) {
            return arr;
          } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
          } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
          }
        };
      }();

      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('AlarmsPageCtrl', AlarmsPageCtrl = function () {

        /** @ngInject */
        function AlarmsPageCtrl($scope, $injector, $location, backendSrv, datasourceSrv, alertSrv) {
          _classCallCheck(this, AlarmsPageCtrl);

          this.alertSrv = alertSrv;
          this.monasca = new MonascaClient(backendSrv, datasourceSrv);
          this.dimensionFilters = [];
          this.stateFilters = [];
          this.severityFilters = [];
          this.stateBool = false;
          this.severityBool = false;
          this.editFilterIndex = -1;

          if ('dimensions' in $location.search()) {
            this.dimensionFilters = $location.search().dimensions.split(',').map(function (kv) {
              return kv.split(':');
            }).map(function (_ref) {
              var _ref2 = _slicedToArray(_ref, 2),
                  k = _ref2[0],
                  v = _ref2[1];

              return { key: k, value: v };
            });
          }

          if(('state' in $location.search()) || ('severity' in $location.search())){
            this.sFilters = $location.search();
          }

          this.pageLoaded = false;
          this.loadFailed = false;
          this.alarms = [];
          this.loadAlarms();

          this.suggestDimensionNames = this._suggestDimensionNames.bind(this);
          this.suggestDimensionValues = this._suggestDimensionValues.bind(this);
        }

        _createClass(AlarmsPageCtrl, [{
          key: '_suggestDimensionNames',
          value: function _suggestDimensionNames(query, callback) {
            this.monasca.listDimensionNames().then(callback);
          }
        }, {
          key: '_suggestDimensionValues',
          value: function _suggestDimensionValues(query, callback) {
            var filter = this.dimensionFilters[this.editFilterIndex];
            if (filter && filter.key) {
              this.monasca.listDimensionValues(filter.key).then(callback);
            }
          }
        }, {
          key: 'editFilter',
          value: function editFilter(index) {
            this.editFilterIndex = index;
          }
        }, {
          key: 'addFilter',
          value: function addFilter() {
            this.dimensionFilters.push({});
          }
        }, {
          key: 'removeFilter',
          value: function removeFilter(index) {
            var filter = this.dimensionFilters[index];
            this.dimensionFilters.splice(index, 1);

            // Don't refresh if the filter was never valid enough to be applied.
            if (filter.key && filter.value) {
              this.refreshAlarms();
            }
          }
        }, {
          key: 'applyFilter',
          value: function applyFilter() {
            // Check filter is complete before applying.
            if (this.dimensionFilters.every(function (f) {
              return f.key && f.value;
            })) {
              this.refreshAlarms();
            }
          }
        }, {
          key: 'refreshAlarms',
          value: function refreshAlarms() {
            if (this.pageLoaded) {
              this.pageLoaded = false;
              this.loadAlarms();
              this.pageLoaded = true;
            }
          }
        }, {
          key: 'loadAlarms',
          value: function loadAlarms() {
            var _this = this;

            if(this.stateBool){
               this.monasca.listSAlarms(this.stateFilters[0]).then(function (alarms) {
                _this.alarms = alarms;
              }).catch(function (err) {
                _this.alertSrv.set("Failed to get alarms.", err.message, 'error', 10000);
                _this.loadFailed = true;
              }).then(function () {
                _this.pageLoaded = true;
              });
            }
            if(this.severityBool){
               this.monasca.listSAlarms(this.severityFilters[0]).then(function (alarms) {
                _this.alarms = alarms;
              }).catch(function (err) {
                _this.alertSrv.set("Failed to get alarms.", err.message, 'error', 10000);
                _this.loadFailed = true;
              }).then(function () {
                _this.pageLoaded = true;
              });
            }
            else {
              this.monasca.listAlarms(this.dimensionFilters).then(function (alarms) {
                _this.alarms = alarms;
              }).catch(function (err) {
                _this.alertSrv.set("Failed to get alarms.", err.message, 'error', 10000);
                _this.loadFailed = true;
              }).then(function () {
                _this.pageLoaded = true;
              });
            }

          }
        }, {
          key: 'setAlarmDeleting',
          value: function setAlarmDeleting(id, deleting) {
            var index = this.alarms.findIndex(function (n) {
              return n.id === id;
            });
            if (index !== -1) {
              this.alarms[index].deleting = true;
            }
          }
        }, {
          key: 'alarmDeleted',
          value: function alarmDeleted(id) {
            var index = this.alarms.find(function (n) {
              return n.id === id;
            });
            if (index !== -1) {
              this.alarms.splice(index, 1);
            }
          }
        }, {
          key: 'confirmDeleteAlarm',
          value: function confirmDeleteAlarm(id) {
            var _this2 = this;

            this.setAlarmDeleting(id, true);

            this.monasca.deleteAlarm(id).then(function () {
              _this2.alarmDeleted(id);
            }).catch(function (err) {
              _this2.setAlarmDeleting(id, false);
              _this2.alertSrv.set("Failed to delete alarm.", err.message, 'error', 10000);
            });
          }
        }, {
          key: 'deleteAlarm',
          value: function deleteAlarm(alarm) {
            var _this3 = this;

            appEvents.emit('confirm-modal', {
              title: 'Delete',
              text: 'Are you sure you want to delete this alarm?',
              text2: alarm.name,
              yesText: "Delete",
              icon: "fa-trash",
              onConfirm: function onConfirm() {
                _this3.confirmDeleteAlarm(alarm.id);
              }
            });
          }
        }, {
          key: 'addStateFilter',
          value: function addStateFilter() {
            this.stateFilters.push({});
          }
        }, {
          key: 'removeStateFilter',
          value: function removeStateFilter(index) {
            var filter = this.stateFilters[index];
            this.stateFilters.splice(index, 1);

            // Don't refresh if the filter was never valid enough to be applied.
            if (filter.value) {
              this.refreshAlarms();
            }
          }
        }, {
          key: 'applyStateFilter',
          value: function applyStateFilter() {
            // Check filter is complete before applying.
            if (this.stateFilters.every(function (f) {
              return f.state;
            })){
              this.stateBool = true;
              this.refreshAlarms();
            }
          }
        }, {
          key: 'addSeverityFilter',
          value: function addSeverityFilter() {
            this.severityFilters.push({});
          }
        }, {
          key: 'removeSeverityFilter',
          value: function removeSeverityFilter(index) {
            var filter = this.severityFilters[index];
            this.severityFilters.splice(index, 1);

            // Don't refresh if the filter was never valid enough to be applied.
            if (filter.severity) {
              this.refreshAlarms();
            }
          }
        }, {
          key: 'applySeverityFilter',
          value: function applySeverityFilter() {
            // Check filter is complete before applying.
            if (this.severityFilters.every(function (f) {
              return f.severity;
            })){
              this.severityBool = true;
              this.refreshAlarms();
            }
          }
        }, {
          key: 'applyAllFilters',
          value: function applyAllFilters() {
            // Check filter is complete before applying.
            if (this.severityFilters.every(function (f) {
              return f.severity;
            })){
              this.severityBool = true;
              this.refreshAlarms();
            }
          }
        }]);

        return AlarmsPageCtrl;
      }());

      _export('AlarmsPageCtrl', AlarmsPageCtrl);

      AlarmsPageCtrl.templateUrl = 'components/alarms.html';
    }
  };
});
//# sourceMappingURL=alarms.js.map
