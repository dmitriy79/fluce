if(!window.ng_flussonic_templates) window.ng_flussonic_templates = angular.module('flussonic-templates',[]);window.ng_flussonic_templates.run(['$templateCache', function($templateCache) {
  $templateCache.put('/flu/html/config.html', '\n\n<div class="container" ng-controller="ConfigController">\n  <div class="row"><h3>Flussonic config</h3></div>\n\n  <div class="alert alert-warning">All media (streams and files) configuration is done now on <a href="#/media">Media</a> tab.</div>\n\n  <div ng-show="loading_config" class="row" style="position: absolute; width:100%; height: 100%; z-index: 5; background: url(\'/flu/admin1/images/spinner.gif\') 50% 50% no-repeat"></div>\n\n  <div ng-if="config_save_error" class="alert alert-danger">\n    <strong>Error saving config!</strong>\n      <span ng-switch="config_save_error">\n        <span ng-switch-when="424">Web UI generated wrong config.</span>\n        <span ng-switch-default>Some server error.</span>        \n      </span>\n  </div>\n\n  <div ng-if="config_load_error" class="alert alert-danger">\n    <strong>Error loading config!</strong>\n      <span ng-switch="config_load_error">\n        <span ng-switch-when="424">Server has invalid config.</span>\n        <span ng-switch-default>Some server error.</span>        \n      </span>\n  </div>\n\n  <div class="row" style="margin-bottom: 10px">\n    <div class="col-sm-3 col-xs-6">\n      <button type="button" class="btn btn-success" ng-click="cancel()">Reload from server</button>       \n    </div>\n    <div class="col-sm-3 col-xs-6">\n      <button type="button" class="btn btn-danger save-config-btn" ng-click="save()" data-loading-text="Saving...">Save and apply</button>\n    </div>\n    <div class="col-sm-6 col-xs-12">\n      <b>Use these functions with CAUTION</b>\n      <span flu-help>\n        If you edit the configuration outside of this GUI and then use the GUI to make changes to the Media Server any previous configuration will be overwritten. Always use the "Reload from server" button before making changes within the GUI.\n      </span>\n    </div>\n  </div>\n\n  <div ng-show="!loading_config && !config_load_error" class="panel-group config-panel-group row" id="config">\n    <div ng-include="\'/flu/html/config-global.html\'" class="panel panel-default"></div>\n    <div ng-include="\'/flu/html/config-advanced.html\'" class="panel panel-default"></div>\n    <div ng-include="\'/flu/html/config-caches.html\'" class="panel panel-default"></div>\n  </div>\n\n  <div class="row" ng-show="show_text_config">\n    <textarea style="width:100%; height: 20em">{{text_config}}</textarea>\n  </div>\n\n  <div class="row" style="padding-top: 20px">\n    <div class="col-lg-12">\n      This product includes GeoLite data created by MaxMind, available from\n      <a href="http://www.maxmind.com">http://www.maxmind.com</a>.\n    </div>\n  </div>\n</div>');
}]);
