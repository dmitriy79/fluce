if(!window.ng_flussonic_templates) window.ng_flussonic_templates = angular.module('flussonic-templates',[]);window.ng_flussonic_templates.run(['$templateCache', function($templateCache) {
  $templateCache.put('/flu/html/config-global.html', '\n<div class="panel-heading">\n  <h4 class="panel-title">\n    <a class="accordion-toggle" data-toggle="collapse" href="div#globalConfig">Global options</a>\n  </h4>\n</div>\n<div id="globalConfig" class="panel-collapse collapse form-horizontal" role=form>\n  <div class="panel-body container">\n\n\n    <div class="form-group">\n      <label class="col-sm-2 col-xs-6 control-label">HTTP listen ports:</label>\n      <div class="col-sm-3 col-xs-6">\n        <div class="input-group input-group-sm" ng-repeat="e in config.data.http track by $index" style="margin-bottom: 10px">\n          <input ng-model="$parent.config.data.http[$index]" class="form-control">\n          <span class="input-group-btn"><button class="btn btn-warning" type="button" ng-click="config.remove_http($index)">remove</button></span>\n        </div>\n        <button class="btn btn-info btn-sm" ng-click="config.add_http()">Add new</button>\n      </div>\n      <div class="col-sm-7 hidden-xs">\n        <span flu-help="popover" data-placement="bottom">Listen ports are to be configured to tell Flussonic what port to listen for incoming connections on per protocol. As you see HTTP has an area where you may allow Flussonic to listen for HTTP requests on numerous ports. We have omitted this option for the other ports for numerous reasons.</span>\n      </div>\n    </div>\n\n\n    <div class="form-group">\n      <label class="col-sm-2 col-xs-6 control-label">HTTPS listen ports:</label>\n      <div class="col-sm-3 col-xs-6">\n        <div class="input-group input-group-sm" ng-repeat="e in config.data.https track by $index" style="margin-bottom: 10px">\n          <input ng-model="$parent.config.data.https[$index]" class="form-control">\n          <span class="input-group-btn"><button class="btn btn-warning" type="button" ng-click="config.remove_https($index)">remove</button></span>\n        </div>\n        <button class="btn btn-info btn-sm" ng-click="config.add_https()">Add new</button>\n      </div>\n      <div class="col-sm-7 hidden-xs">\n        <span flu-help="popover" data-placement="bottom">Configure HTTPS listen ports.</span>\n      </div>\n    </div>\n\n\n\n\n    <div class="form-group">\n      <label class="col-sm-2 col-xs-6 control-label">RTMP listen port:</label>\n      <div class="col-sm-2 col-xs-6"><input ng-model="config.data.rtmp" class="form-control input-sm"></div>\n    </div>\n\n    <div class="form-group">\n      <label class="col-sm-2 col-xs-6 control-label">RTSP listen port:</label>\n      <div class="col-sm-2 col-xs-6"><input ng-model="config.data.rtsp" class="form-control input-sm"></div>\n    </div>\n\n    <div class="form-group">\n      <label class="col-sm-2 col-xs-6 control-label">Log level:</label>\n      <div class="col-sm-2 col-xs-6"><select ng-model="config.data.loglevel" class="form-control input-sm" ng-options="level as level for level in loglevels"></select></div>\n      <div class="col-sm-8 hidden-xs">\n        <span flu-help="popover">Log levels tells Flussonic the level of logging to do. IE Debug is the highest level of logging.</span>\n      </div>\n    </div>\n\n\n\n    <div class="form-group">\n      <label class="col-sm-2 col-xs-6 control-label">Global auth URL:</label>\n      <div class="col-sm-2 col-xs-6"><input ng-model="config.data.auth.url" class="form-control input-sm"></div>\n      <div class="col-sm-8 hidden-xs"><span flu-help="popover">Here you can add global authorization url or disable sessions with value \'false\'. <a target="_blank" href="http://www.flussonic.com/doc/auth">Read more.</a></span></div>\n    </div>\n\n    <div class="form-group">\n      <label class="col-sm-2 col-xs-6 control-label">Max connections:</label>\n      <div class="col-sm-2 col-xs-6"><input ng-model="config.data.max_sessions" class="form-control input-sm"></div>\n      <div class="col-sm-8 hidden-xs">\n        <span flu-help="popover">Set Server wide connections limits over-riding any and all stream specific configurations.</span>\n      </div>\n    </div>\n\n\n    <div class="form-group">\n      <label class="col-sm-2 col-xs-6 control-label">Cluster key:</label>\n      <div class="col-sm-2 col-xs-6"><input ng-model="config.data.cluster_key" class="form-control input-sm"></div>\n      <div class="col-sm-8 hidden-xs">\n        <span flu-help="popover">Cluster authorization password. Use the same on all servers in your cluster.</span>\n      </div>\n    </div>\n\n\n    <div class="form-group">\n      <label class="col-sm-2 col-xs-6 control-label">Event handlers:</label>\n      <div class="col-sm-3 col-xs-6">\n        <div class="input-group input-group-sm" ng-repeat="e in config.data.notifies track by $index" style="margin-bottom: 10px">\n          <input ng-model="$parent.config.data.notifies[$index]" class="form-control">\n          <span class="input-group-btn"><button class="btn btn-warning" type="button" ng-click="config.remove_notify($index)">remove</button></span>\n        </div>\n        <button class="btn btn-info btn-sm" ng-click="config.add_notify()">Add new</button>\n      </div>\n      <div class="col-sm-7 hidden-xs">\n        <span flu-help="popover">Enables event handlers that will send all Flussonic events in JSON format via POST to an external script. You can use it to collect session data or stream status events.</span>\n      </div>\n    </div>\n\n\n\n    <div class="form-group">\n      <label class="col-sm-2 col-xs-4 control-label">View authorization: </label>\n      <div class="col-sm-2 col-xs-4">\n        <input ng-model="config.data.view_auth.login" type="text" class="form-control input-sm">\n        <span class="help-block">login</span>\n      </div>\n      <div class="col-sm-2 col-xs-4">\n        <input ng-model="config.data.view_auth.password" type="text" class="form-control input-sm">\n        <span class="help-block">password</span>\n      </div>\n      <div class="col-sm-6 hidden-xs">\n        <span flu-help="popover">Enables HTTP Basic protection for admin page and for read-only API requests.</span>\n      </div>\n    </div>\n\n\n    <div class="form-group">\n      <label class="col-sm-2 col-xs-4 control-label">Edit authorization: </label>\n      <div class="col-sm-2 col-xs-4">\n        <input ng-model="config.data.edit_auth.login" type="text" class="form-control input-sm">\n        <span class="help-block">login</span>\n      </div>\n      <div class="col-sm-2 col-xs-4">\n        <input ng-model="config.data.edit_auth.password" type="text" class="form-control input-sm">\n        <span class="help-block">password</span>\n      </div>\n      <div class="col-sm-6 hidden-xs">\n        <span flu-help="popover">Enables HTTP Basic protection for API requests that modify state of server (config reloading and stream restart).</span>\n      </div>\n    </div>\n\n\n  </div>\n</div>\n');
}]);
