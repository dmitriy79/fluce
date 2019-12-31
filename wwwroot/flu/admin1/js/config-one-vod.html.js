if(!window.ng_flussonic_templates) window.ng_flussonic_templates = angular.module('flussonic-templates',[]);window.ng_flussonic_templates.run(['$templateCache', function($templateCache) {
  $templateCache.put('/flu/html/config-one-vod.html', '<div class="btn-group btn-group-xs">\n  <button class="btn btn-default" type=button btn-checkbox ng-model="v.show_options">options</button>\n</div>\n\n<div style="margin-top: 20px"></div>\n\n<div ng-show="v.show_options">\n  <div class="form-group">\n    <label class="col-lg-2 control-label">VOD auth URL:</label>\n    <div class="col-lg-3"><input ng-model="v.auth.url" class="form-control input-sm"></div>\n    <div class="col-lg-7"><span flu-help="popover">Here you can add authorization url or disable sessions with value \'false\'. <a target="_blank" href="http://www.flussonic.com/doc/auth">Read more.</a></span></div>\n  </div>\n\n\n  <div class="form-group">\n    <label class="col-lg-2 control-label">Domain lock:</label>\n    <div class="col-lg-3"><input ng-model="v.auth.domains_s" class="form-control input-sm"></div>\n    <div class="col-lg-7">\n      <span flu-help="popover">\n        Flussonic has the ability to protect your streams on a per domain or domain wildcard. Write them comma separated. \n        Use the following format in this field:\n        <Br>\n        Per Domain: domain.com,domain2.com\n        <br>\n        Wildcards: .domain.com,*.domain2.com\n      </span>\n    </div>\n  </div>\n\n  <div class="form-group">\n    <label class="col-lg-2 control-label">Allowed countries</label>\n    <div class="col-lg-3"><input ng-model="s.options.auth.allowed_countries_s" class="form-control input-sm"></div>\n    <div class="col-lg-7"><span flu-help>Allow access to the stream by peer country</span></div>\n  </div>\n  \n  <div class="form-group">\n    <label class="col-lg-2 control-label">Disallowed countries</label>\n    <div class="col-lg-3"><input ng-model="s.options.auth.disallowed_countries_s" class="form-control input-sm"></div>\n    <div class="col-lg-7"><span flu-help>Flussonic can limit this feed to reject view on a per country basis. To do this you would simple enter the Alpha2 to code in this field. \n  <br>IE: us,ru,eu - Please note, once you do this the feed will only play in the specified country or countries here.<br>\n  <a href="http://en.wikipedia.org/wiki/ISO_3166-1" target="_blank">Please see Alpha2 code on this page for more reference.</a>\n    </span></div>\n  </div>\n\n  <div class="form-group">\n    <label class="col-lg-2 control-label">Enable downloading:</label>\n    <div class="col-lg-3"><input type="checkbox" ng-model="v.download" class="form-control input-sm"></div>\n    <div class="col-lg-7"><span flu-help>Allow downloading files like plain HTTP server.</span></div>\n  </div>\n\n  <div class="form-group">\n    <label class="col-lg-2 control-label">Disk read queue:</label>\n    <div class="col-lg-3"><input ng-model="v.read_queue" class="form-control input-sm"></div>\n    <div class="col-lg-7"><span flu-help>Max. simultaneous requests to HDD per whole location.</span></div>\n  </div>\n\n  <div class="form-group">\n    <label class="col-lg-2 control-label">Max readers:</label>\n    <div class="col-lg-3"><input ng-model="v.max_readers" class="form-control input-sm"></div>\n    <div class="col-lg-7"><span flu-help>Max. simultaneous requests to HDD per one opened file.</span></div>\n  </div>\n  \n\n    <div class="form-group">\n      <label class="col-lg-2 control-label">Per-location cache path:</label>\n      <div class="col-lg-3"><input ng-model="v.cache.path" class="form-control input-sm"></div>\n      <div class="col-lg-7"><span flu-help>Configure cache only for this location.</span></div>\n    </div>\n\n    <div class="form-group">\n      <label class="col-lg-2 control-label">cache TTL:</label>\n      <div class="col-lg-3"><input ng-model="v.cache.time_limit" class="form-control input-sm"></div>\n      <div class="col-lg-7">\n        <span flu-help>Time after which cache data is erased: 1h for 1 hour, 1d for 1 day</span>\n      </div>\n    </div>\n\n    <div class="form-group">\n      <label class="col-lg-2 control-label">cache size limit:</label>\n      <div class="col-lg-3"><input ng-model="v.cache.disk_limit" class="form-control input-sm"></div>\n      <div class="col-lg-7">\n        <span flu-help>Max disk size for cache: 1M for 1 megabyte, 1G for 1 gigabyte</span>\n      </div>\n    </div>\n</div>\n\n');
}]);
