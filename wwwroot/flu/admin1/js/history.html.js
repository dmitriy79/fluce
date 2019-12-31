if(!window.ng_flussonic_templates) window.ng_flussonic_templates = angular.module('flussonic-templates',[]);window.ng_flussonic_templates.run(['$templateCache', function($templateCache) {
  $templateCache.put('/flu/html/history.html', '\n<div class="container" ng-controller="HistoryController">  \n  <div class="row" ng-show="history.length == 0">\n    No information here yet.<br>\n\n    When users will watch some video from this server and their sessions will be logged into database,\n    information about streams and files will appear here.\n  </div>\n\n  <div class="panel-group config-panel-group row" style="min-height: 600px; position: relative">\n      \n    <div ng-show="loading_history" style="position: absolute; width:100%; height: 100%; z-index: 5; background: url(\'/flu/admin1/images/spinner.gif\') 50% 50% no-repeat"></div>\n\n    <!-- one panel start -->\n    <div class="panel panel-default" ng-repeat="media in history track by $index">\n      \n      <div class="panel-heading">\n        <h4 class="panel-title">\n          <a class="accordion-toggle" data-toggle="collapse" href="div#{{media.vname}}">{{media.name}}</a>\n        </h4>\n      </div>\n      <div id="{{media.vname}}" class="panel-collapse collapse">\n        <div class="panel-body container">\n          <div  class="row">\n            <div class="col-lg-3">\n              <ul class="list-group">\n                <li class="list-group-item">Total clients: <span class="badge">{{media.total_clients}}</span></li>\n                <li class="list-group-item">Total bytes: <span class="badge">{{media.total_bytes_s}}</span></li>\n                <li class="list-group-item">Total view time: <span class="badge">{{media.total_view_time_s}}</span></li>\n              </ul>\n            </div>\n\n            <div class="col-lg-5">\n              <div world-map="media.countries" style="width: 100%; height: 400px"></div>\n            </div>\n\n            <div class="col-lg-4" ng-if="media.pulse">\n              <div pulse-flow="media.pulse" resolution="hour"\n                  options="{yaxes:[{position:\'left\'},{position:\'right\'}], yaxis : {type : \'net\'}}" \n                  style=\'height:350px; width: 100%; float:left; margin-bottom: 40px\'>Media traffic</div>\n              \n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n    <!-- one panel stop -->\n\n  </div>\n</div> \n\n\n<script>\n\n  var gdpData = {\n    "AF": 16.63,\n    "AL": 11.58,\n    "DZ": 158.97\n  };\n\n  $(".panel-collapse").on("shown.bs.collapse", function(evt) {\n    var map = $(this).find(".world-map");\n    if(map.find("div").length != 0) return;\n\n    map.vectorMap({\n      map: \'world_mill_en\',\n      series: {\n        regions: [{\n          values: gdpData,\n          scale: [\'#C8EEFF\', \'#0071A4\'],\n          normalizeFunction: \'polynomial\'\n        }]\n      },\n      onRegionLabelShow: function(e, el, code){\n        el.html(el.html()+\' (GDP - \'+gdpData[code]+\')\');\n      }\n    });\n\n\n  });\n</script>\n');
}]);