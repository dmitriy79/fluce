
window.FlussonicAdmin = angular.module("FlussonicAdmin", ['ngRoute', 'ui.bootstrap', 'flu.player', 'flussonic-templates']);

window.FlussonicAdmin.config(["$routeProvider", function($routeProvider) {
  var t = Number(new Date());
  $routeProvider.
    when("/", {templateUrl : "/flu/html/dashboard.html"}).
    when("/media", {templateUrl : "/flu/html/media.html"}).
    when("/pulse", {templateUrl : "/flu/html/pulse.html"}).
    when("/pulse-custom", {templateUrl : "/flu/html/pulse-custom.html"}).
    when("/history", {templateUrl : "/flu/html/history.html"}).
    when("/config", {templateUrl : "/flu/html/config.html"}).
    when("/vod", {templateUrl : "/flu/html/vod.html"}).
    when("/ad_injector", {templateUrl : "/flu/html/ad_injector.html"}).
    when("/support", {templateUrl : "/flu/html/support.html"}).
    when("/iptv", {templateUrl : "tv/web/admin.html"}).
    otherwise({redirectTo : "/"});
}]).

directive("fluHelp", FluHelpDirective).
directive("dvrStatus", DvrStatusDirective).
directive("worldMap", WorldMapDirective).
directive("vodUpload", VodUploadDirective).
directive("adSchedules", AdSchedulesDirective).
directive("adSchedule", AdScheduleDirective).
directive("mediaLog", MediaLogDirective).
directive("ngShow", ngShowDirective).
// directive("fluPlayer", fluPlayerDirective).
factory("$flu", FluFactory).
factory("$ws", WebsocketFactory).
factory("$pulse", ['$rootScope', '$timeout', '$ws', PulseFactory]).
factory("$fluConfig", FluConfigFactory).
directive("pulseFlow", ['$pulse', '$compile', PulseFlowDirective]).
directive("dvrReactPlayer", [dvrReactPlayerDirective])
;



function ngShowDirective() {
  return function(scope, element, attr) {
    scope.$watch(attr.ngShow, function ngShowWatchAction(value){
      if(value) element.removeClass('ng-hide');
      else element.addClass('ng-hide');
    });
  };
};



function dvrReactPlayerDirective() {
  var link = function($scope, $element, $attrs) {
    var auth_token = $scope.$eval($attrs.authToken) || "";
    var stream = $scope.$eval($attrs.dvrReactPlayer);
    $element[0].innerHTML = "<iframe style='width:100%;min-height:800px;height:100%' src='/"+stream.name+"/embed.html?dvr=true'></iframe>";
  }

  return {
    restrict : "EA",
    link : link
  }  

};



//  $$$$$$\                                                      $$\     
// $$  __$$\                                                     $$ |    
// $$ /  \__| $$$$$$\  $$$$$$$\  $$$$$$$\   $$$$$$\   $$$$$$$\ $$$$$$\   
// $$ |      $$  __$$\ $$  __$$\ $$  __$$\ $$  __$$\ $$  _____|\_$$  _|  
// $$ |      $$ /  $$ |$$ |  $$ |$$ |  $$ |$$$$$$$$ |$$ /        $$ |    
// $$ |  $$\ $$ |  $$ |$$ |  $$ |$$ |  $$ |$$   ____|$$ |        $$ |$$\ 
// \$$$$$$  |\$$$$$$  |$$ |  $$ |$$ |  $$ |\$$$$$$$\ \$$$$$$$\   \$$$$  |
//  \______/  \______/ \__|  \__|\__|  \__| \_______| \_______|   \____/ 
                                                                      

function WebsocketFactory($rootScope) {
  if(!$rootScope.WS) {
    $rootScope.WS = {
      connected : false,
      disabled : false,
      socket : undefined,
      outgoing : [],
      stopReconnect : function(){
        if(this.reconnect_timer){
          clearTimeout(this.reconnect_timer);
          this.reconnect_timer = null;
        }
      }
    };    
  }

  var WS = $rootScope.WS;


  function connect() {
    if(WS.socket || WS.disabled || !window.WebSocket) {
      return false;
    }
    var ws_protocol = window.location.protocol === 'https:' ? "wss:" : "ws:";
    WS.socket = new WebSocket(ws_protocol +"//"+window.location.host+"/flussonic/api/events");

    WS.socket.onopen = function(e) {
      WS.stopReconnect();
      WS.connected = true;
      for(var i = 0; i < WS.outgoing.length; i++) {
        WS.socket.send(WS.outgoing[i]);
      }
      WS.outgoing = [];
      if (WS.resubscribe_pulse){
        $rootScope.$broadcast("$resubscribe");
        WS.resubscribe_pulse = false;
      }
    };

    WS.socket.onmessage = function(e) {
      var msg = JSON.parse(e.data);
      if(msg.event == 'session.open' || msg.event == 'session.close') {
        return;
      }

      $rootScope.$apply(function () {
        $rootScope.$broadcast("flu:message", msg);
        $rootScope.$broadcast("flu:"+msg.event, msg);
      });
    };

    var reconnect = function(error) {
      WS.disabled = true;
      WS.socket = null;
      WS.resubscribe_pulse = true;

      if (error)
        WS.stopReconnect();

      if (!WS.reconnect_timer)
        WS.reconnect_timer = setTimeout(function() {
          WS.disabled = false;
          connect();
        }, 2000);
    };

    WS.socket.onclose = function(e){ reconnect(false); };
    WS.socket.onerror = function(e){ reconnect(true); };
  }

  connect();

  WS.send = function(msg) {
    if(WS.socket && WS.socket.readyState == WebSocket.OPEN) {
      WS.socket.send(msg);  
    } else {
      WS.outgoing.push(msg);
      connect();
    }
  }
  return WS;
}

function PulseFactory($rootScope, $timeout, $ws) {
  var Pulse = {pulses : {}, count : 0};

  Pulse.subscribe = function(name) {
    if(!Pulse.pulses[name]) {
      $ws.send("pulse_subscribe:"+name);
      Pulse.pulses[name] = true;
      Pulse.count++;
    }
  }
  Pulse.unsubscribe = function(name) {
    if(Pulse.pulses[name]) {
      $ws.send("pulse_unsubscribe:"+name);
      Pulse.count--;
      delete Pulse.pulses[name];
    }
  }

  return Pulse;
}

function FluFactory($rootScope, $http, $ws) {
  var Flu = {count : 0};
  Flu.request = function(api) {
    Flu.count++;
    // console.log("api: "+api+": "+Flu.count);
    if(window.WebSocket) {
      $ws.send(api);
    } else {
      $http.get("/flussonic/api/"+api).success(function(msg) {
        $rootScope.$broadcast("flu:message", msg);
        $rootScope.$broadcast("flu:"+msg.event, msg);      
      });      
    }
  }
  return Flu;
}




// $$$$$$$\            $$\                     
// $$  __$$\           $$ |                    
// $$ |  $$ |$$\   $$\ $$ | $$$$$$$\  $$$$$$\  
// $$$$$$$  |$$ |  $$ |$$ |$$  _____|$$  __$$\ 
// $$  ____/ $$ |  $$ |$$ |\$$$$$$\  $$$$$$$$ |
// $$ |      $$ |  $$ |$$ | \____$$\ $$   ____|
// $$ |      \$$$$$$  |$$ |$$$$$$$  |\$$$$$$$\ 
// \__|       \______/ \__|\_______/  \_______|
                                            
                                            



function PulseFlowDirective($pulse, $compile) {

  function format_pulse_minutes(t) {
    var d = new Date(t*1000);
    var h = "" + d.getHours();
    if(h.length < 2) h = "0" + h;
    var m = "" + d.getMinutes();
    if(m.length < 2) m = "0" + m;
    return h + ":" + m;
  }

  function mbitFormatter(val, axis) {
    if (val > 700000000)
      return (val / 1000000000).toFixed(axis.tickDecimals) + " Gb";
    if (val > 700000)
      return (val / 1000000).toFixed(axis.tickDecimals) + " Mb";
    else if (val > 700)
      return (val / 1000).toFixed(axis.tickDecimals) + " Kb";
    else
      return val.toFixed(axis.tickDecimals) + " b";
  }

  function draw($element, $attrs, data) {
    var inner = $element.find(".plot");
    var plot = inner.data("plot");
    if(!plot) {
      var options = {
        xaxis: {
          mode: "time",
          timeformat: "%H:%M:%S",
          timezone : "browser"
        },
        yaxis: {
          min: 0,
          tickDecimals : 0
        },
        legend: {
          position: "nw"
        }
      };

      if($attrs.options) {
        $.extend(true, options, eval('('+$attrs.options+')'));
      }

      if($attrs.resolution == "hour") {
        options.xaxis.timeformat = "%H:%M";
      }

      if(options.yaxis.type == "net") {
        if(!options.yaxes) options.yaxes = [{}];
        options.yaxes[0].tickDecimals = 1;
        options.yaxes[0].tickFormatter = mbitFormatter;
      }

      inner.plot(data, options);
    } else {
      plot.setData(data);
      plot.setupGrid();
      plot.draw();
    }

  }

  function link($scope, $element, $attrs) {
    var playing = true;
    var text = $element.text();
    var header = text.length > 0 ? "<h5 style='padding-left: 40px'>"+text+"</h5>" : "";
    $element.html(header+"<div class='plot pulse-flow' style='width:100%;height:100%'><span class='pulse-preload'><span></span>Loading</span></div>");
    $compile($element.find("h5").contents())($scope);

    if($attrs.pulseFlow) {
      $attrs.pulseName = $attrs.pulseFlow.split(":")[0];    
    }

    if(!$attrs.subscribe) {
      var panel = $($element).parents(".panel-collapse")[0];
      var has_shown_first_time = false;
      $(panel).on("shown.bs.collapse", function() {
        if(!has_shown_first_time) {
          has_shown_first_time = true;
          draw($element, $attrs, $scope.$eval($attrs.pulseFlow));
        }
        var plot = $element.find(".plot").data("plot");
        plot.resize();
        plot.setupGrid();
        plot.draw();
      });

      return;
    }

    // console.log("pulse "+$attrs.pulseFlow+" is initing");

    if($attrs.showIf) {
      // console.log("conditional pulse "+$attrs.pulseFlow);
      $scope.$watch($attrs.showIf, function(value) {
        if(value) {
          // console.log("enable pulse "+$attrs.pulseFlow);
          $element.show();
          playing = true;
          $pulse.subscribe($attrs.pulseFlow);
        } else {
          // console.log("disable pulse "+$attrs.pulseFlow);
          playing = false;
          $pulse.unsubscribe($attrs.pulseFlow);
          $element.hide();
        }
      });
    } else {
      $pulse.subscribe($attrs.pulseFlow);
    }

    $scope.$on("$resubscribe", function(e,message) {
      $pulse.unsubscribe($attrs.pulseFlow);
      $pulse.subscribe($attrs.pulseFlow);
    });

    $scope.$on("flu:pulse.traffic", function(e,message) {
      if(!message[$attrs.pulseName]) {
        // console.log("got pulse message without "+$attrs.pulseFlow);
        return;
      }
      // console.log("pulse "+$attrs.pulseFlow+" playing:"+playing);
      if(!playing) {
        // console.log("got old pulse message with "+$attrs.pulseFlow+", unsubscribing");
        $pulse.unsubscribe($attrs.pulseFlow);
        return;
      }

      var data = message[$attrs.pulseName][$attrs.resolution];
      if(!data) return;
      if(message.partial_update) {
        var i, j;
        for(i = 0 ; i < data.length; i++) {
          for(j = 0; j < $scope.data.length; j++) {
            if($scope.data[j].label == data[i].label) {
              if($scope.data[j].data.length > 60) {
                $scope.data[j].data.splice(0,1);                
              }
              if(!$scope.data[j].last_dts || $scope.data[j].last_dts < data[i].data[0][0]) {
                $scope.data[j].data.push(data[i].data[0]);
                $scope.data[j].last_dts = data[i].data[0][0];
              }
            }
          }
        }
      } else {
        $scope.data = data;
        for(var j = 0; j < $scope.data.length; j++) {
          if ($scope.data[j].data.length > 0)
            $scope.data[j].last_dts = $scope.data[j].data[$scope.data[j].data.length - 1][0];
        }
      }
      draw($element, $attrs, $scope.data);

    });
    $scope.$on("$destroy", function() {
      // console.log("pulse "+$attrs.pulseFlow+" is destroying");
      $pulse.unsubscribe($attrs.pulseFlow);
    });
  };

  return {scope : true, link : link};
}

function PulseCustomController($scope, $http, $timeout) {
    $scope.raw_query = "";
    $scope.resolution = "custom";

    $scope.show = function(){
        $scope.queries = [];
        if (!!$scope.raw_query) {
          var query = {value: 'custom/' + $scope.raw_query,name: $scope.raw_query, options : {}};
          if($scope.raw_query.indexOf("_input") != -1 || $scope.raw_query.indexOf("_output") != -1) {
            query.options.yaxis = {type : 'net'};
          }
          if($scope.raw_query.indexOf("_usage") != -1) {
            query.options.yaxis = {max : 100};
          }
          $scope.queries = [query];
        }
    };
}

function PulseController($scope, $http) {
  // $http.get("/flussonic/api/pulse?pulses=disk_space").success(function(reply) {
  // });

  $http.get("/flussonic/api/server").success(function(reply) {
    $scope.disks = reply.disks;
    $scope.partitions = [];
    for(var i = 0; i < reply.partitions.length; i++) {
      (function (vol, pulse) {
        $http.get("/flussonic/api/pulse?pulses="+pulse).success(function(r) {
          if(!r[pulse]) return;
          var s = r[pulse].minute[0].data;
          if(s.length == 0) return;
          var usage = s[0][1];

          var part = {mount : vol, usage: usage};

          if(usage < 25) {
            part.status = "info";
          } else if(usage < 50) {
            part.status = "success";
          } else if(usage < 75) {
            part.status = "warning";
          } else {
            part.status = "danger";
          }

          $scope.partitions.push(part);
        });
      })(reply.partitions[i], "disk_space_used{disk=" + reply.partitions[i].path + "}");
    }
  });
}





// $$\   $$\                     
// $$$\  $$ |                    
// $$$$\ $$ | $$$$$$\ $$\    $$\ 
// $$ $$\$$ | \____$$\\$$\  $$  |
// $$ \$$$$ | $$$$$$$ |\$$\$$  / 
// $$ |\$$$ |$$  __$$ | \$$$  /  
// $$ | \$$ |\$$$$$$$ |  \$  /   
// \__|  \__| \_______|   \_/    
                              
                              
                              






function NavController($scope, $location, $http) {
  $scope.license = undefined;
  $scope.version = "";

  $scope.navClass = function(page) {
    var currentRoute = $location.path().substring(1) || (window.location.pathname == "/vsaas" ? "vsaas" : 'dashboard');
    return page === currentRoute ? 'active' : '';
  }

  var central_messages = {
    "connecting" : "trying to connect",
    "license_disabled" : "license key is disabled",
    "central_error" : "some error on central",
    "network_error" : "network error while connecting to central"
  };

  $http.get("/flussonic/api/server").
  success(function(message) {
    $scope.version = message.version;
    $scope.next_version = message.next_version;
    $scope.license = message.license;
    $scope.ad_injector = message.ad_injector;
    $scope.vsaas = message.vsaas;
    $scope.iptv = message.iptv;
    if(message.status) {
      var flu_errors = [];
      for(var k in message.status) {
        if(k.indexOf("error_") != -1) {
          flu_errors.push({error : k.substr(6), message : message.status[k]});
        }
      }
      if(flu_errors.length > 0){
        $scope.flu_errors = flu_errors;
      }
    }
    if(message.central_status) {
      $scope.central_status = message.central_status;
      if($scope.central_status == "connected") {
        $scope.central_connected = true;
      } else {
        $scope.central_error = true;
        $scope.central_message = central_messages[message.central_status] || message.central_status;
      }
      
    }

    if (window.location.protocol == 'http:') {
      window.flu_http_port = message.http || 80;
    } else if (window.location.protocol == 'https:') {
      window.flu_http_port = message.https || 443;
    } else {
      console.log("Unknown window.location.protocol proto");
      window.flu_http_port = message.http || 80; // fallback
    }

    if(document.location.port.length > 0 && parseInt(document.location.port) != window.flu_http_port && document.location.protocol == "http:") {
      window.flu_http_port = parseInt(document.location.port);
    } else if(typeof(window.flu_http_port) == "string") {
      var parts = window.flu_http_port.split(":");
      window.flu_http_port = parseInt(parts[parts.length-1]);
    }
    window.flu_rtmp_port = message.rtmp || 1935;
    if(typeof(window.flu_rtmp_port) == "string") {
      var parts = window.flu_rtmp_port.split(":");
      window.flu_rtmp_port = parseInt(parts[parts.length-1]);      
    }
  });


}





function DashboardController($scope, $http, $fluConfig) {
  $scope.online_streams = 0;
  $scope.total_streams = 0;
  $scope.opened_files = 0;
  $scope.total_clients = 0;
  $scope.config_streams = 0;
  $scope.config_lives = 0;
  $scope.config_vods = 0;
  $http.get("/flussonic/api/server").
  success(function(message) {
    $scope.uptime = format_seconds(message.uptime);
  });


  $http.get("/flussonic/api/streams").success(function(m) {
    for(var i = 0; i < m.streams.length; i++) {
      $scope.total_streams++;
      if(m.streams[i].alive) {
        $scope.online_streams++;
      }
      $scope.total_clients += m.streams[i].client_count;
    }
  });

  $http.get("/flussonic/api/files").success(function(m) {
    for(var i = 0; i < m.files.length; i++) {
      $scope.opened_files++;
      $scope.total_clients += m.files[i].client_count;
    }
  });

  $scope.config = $fluConfig;
  $scope.config.load().then(function() {
    $scope.config_streams = $scope.config.data.streams.length;
    $scope.config_lives = $scope.config.data.lives.length;
    $scope.config_vods = $scope.config.data.vods.length;
  });  

}




// $$$$$$$\  $$\                     
// $$  __$$\ $$ |                    
// $$ |  $$ |$$ | $$$$$$\  $$\   $$\ 
// $$$$$$$  |$$ | \____$$\ $$ |  $$ |
// $$  ____/ $$ | $$$$$$$ |$$ |  $$ |
// $$ |      $$ |$$  __$$ |$$ |  $$ |
// $$ |      $$ |\$$$$$$$ |\$$$$$$$ |
// \__|      \__| \_______| \____$$ |
//                         $$\   $$ |
//                         \$$$$$$  |
//                          \______/ 




function PlayStream(url, $http, name) {
  if(!name) name = url;


  function osmf_player(element, url, info) {
    var width = info && info.width || 640;
    var height = info && info.height || 480;

    $("#"+element).html(
"<div id='video-"+element+"'></div>"+
"<iframe frameborder=\"0\" style=\"width:"+width+"px; height:"+height+"px;\" src=\"/"+name+"/embed.html\"></iframe>\n");
  }


  var opts = {
    backdropFade: true,
    dialogFade:true
  };


  $("#playStream .modal-body").html("<div id='playStreamBody'></div>");
  $('#playStream').modal(opts);
  $("#playStream .play-title").html('Now playing: '+url);
  var f = osmf_player;


  var g = function(info) {
    if(info.width && info.height) {
      info.original_width = info.width;
      info.original_height = info.height;
      var max_width = $(window).width > 1024 ? 800 : $(window).width() - 40;
      while(info.width < 640 && info.width < max_width) {
        info.width = Math.round(info.width*1.2);
        info.height = Math.round(info.height*1.2);
      }
      while(info.height > 480) {
        info.width = Math.round(info.width / 1.2);
        info.height = Math.round(info.height / 1.2);
      }
      while(info.width > max_width) {
        info.width = Math.round(info.width / 1.2);
        info.height = Math.round(info.height / 1.2);
      }
      // console.log("moved "+info.original_width+"x"+info.original_height+" to "+
      //   info.width+"x"+info.height +" screen: "+$(window).width()+"x"+$(window).height());
      $("#playStream .modal-dialog").css("width", (max_width)+"px");
    }

    osmf_player("playStreamBody", url, info);
  }

  var stream_ = (name[0] == "/" || name.indexOf("http") == 0) ? name : "/" + name;

  if(name.indexOf("http") == 0) {
    g({original_width:640, original_height:480});
  } else {
    $http.get("/flussonic/api/media_info"+stream_).
      success(g).
      error(function() { g({original_width:640, original_height:480}); } );    
  }


  $("#playStream").on('hidden.bs.modal', function() {
    $("#playStream .modal-body").html("");
  });
}





function DashboardPlayController($scope, $http) {
  $scope.stream = "";

  $scope.play = function() {
    PlayStream($scope.stream, $http);
    $scope.shouldBeOpen = true;
  }

  $scope.close = function () {
    $scope.shouldBeOpen = false;
    $("#playStream .modal-body").html("");
  };


  $scope.shouldBeOpen = false;
}



// $$\   $$\           $$\                           $$\       $$\                               
// $$ |  $$ |          $$ |                          $$ |      $$ |                              
// $$ |  $$ | $$$$$$\  $$ | $$$$$$\   $$$$$$\   $$$$$$$ |      $$ | $$$$$$\   $$$$$$\   $$$$$$$\ 
// $$ |  $$ |$$  __$$\ $$ |$$  __$$\  \____$$\ $$  __$$ |      $$ |$$  __$$\ $$  __$$\ $$  _____|
// $$ |  $$ |$$ /  $$ |$$ |$$ /  $$ | $$$$$$$ |$$ /  $$ |      $$ |$$ /  $$ |$$ /  $$ |\$$$$$$\  
// $$ |  $$ |$$ |  $$ |$$ |$$ |  $$ |$$  __$$ |$$ |  $$ |      $$ |$$ |  $$ |$$ |  $$ | \____$$\ 
// \$$$$$$  |$$$$$$$  |$$ |\$$$$$$  |\$$$$$$$ |\$$$$$$$ |      $$ |\$$$$$$  |\$$$$$$$ |$$$$$$$  |
//  \______/ $$  ____/ \__| \______/  \_______| \_______|      \__| \______/  \____$$ |\_______/ 
//           $$ |                                                            $$\   $$ |          
//           $$ |                                                            \$$$$$$  |          
//           \__|                                                             \______/           


function SupportController($scope, $http) {
  $scope.comment = "";

  $scope.uploadLogs = function() {
    if($scope.uploadForm.$invalid) {
      $scope.error_msg = "You must add some comment about your problem";
      return false;
    }
    $scope.error_msg = "";
    $scope.status = "uploading";
    $scope.showTicket = true;
    $scope.uploading = true;

    $http({
      method: 'POST',
      url: "/flussonic/api/sendlogs",
      data: {comment : $scope.comment},
      timeout : 20000}).

    success(function(reply) {
      var ticket = reply.ticket;
      $scope.status = "";
      $scope.uploading = false;
      $scope.ticket = reply.ticket;
    }).
    error(function(reply, status) {
      var error_text = "Error";
      if(reply.error) error_text = "Error: "+reply.error;
      error_text = error_text + ".  Code #"+status;
      $scope.status = "";
      $scope.uploading = false;
      $scope.ticket = error_text;
    });
  }

  $scope.showTicket = false;
  $scope.status = "";
}



// $$\      $$\                 $$\ $$\           
// $$$\    $$$ |                $$ |\__|          
// $$$$\  $$$$ | $$$$$$\   $$$$$$$ |$$\  $$$$$$\  
// $$\$$\$$ $$ |$$  __$$\ $$  __$$ |$$ | \____$$\ 
// $$ \$$$  $$ |$$$$$$$$ |$$ /  $$ |$$ | $$$$$$$ |
// $$ |\$  /$$ |$$   ____|$$ |  $$ |$$ |$$  __$$ |
// $$ | \_/ $$ |\$$$$$$$\ \$$$$$$$ |$$ |\$$$$$$$ |
// \__|     \__| \_______| \_______|\__| \_______|
                                               
                                               
                                               

function format_bytes(bytes) {

  if(!bytes) return "";

  var kilobytes = Math.round(bytes / 1024);

  if(kilobytes < 5000)
    return "" + add_spaces_to_int(kilobytes) + "KB";

  var megabytes = Math.round(kilobytes / 1024);
  if(megabytes < 5000)
    return "" + add_spaces_to_int(megabytes) + "MB";

  var gigabytes = Math.round(megabytes / 1024);
  return "" + add_spaces_to_int(gigabytes) + "GB";
}

function add_spaces_to_int(i) {
  if(i > 0) {
    var d1 = Math.round(i % 1000);
    var d2 = add_spaces_to_int(Math.round(i / 1000));
    return d2 == "" ? d1 + " " : d2 + pad(d1,3) + " ";
  } else {
    return "";
  }
}


function pad(number, width) {
  var input = number + "";  // make sure it's a string
  return("00000000000000000000".slice(0, width - input.length) + input);
}


function format_seconds(sec) {
  if(! (sec > 0)) {
    return 0;
  }

  sec = Math.round(sec);
  var lt = sec;
  var lt_s = pad(lt % 60, 2); lt = Math.floor(lt / 60);
  if(lt > 0) {
    lt_s = pad(lt % 60,2) + ":" + lt_s;
    lt = Math.floor(lt / 60);
  } else {
    lt_s = lt_s + " s";
  }
  if(lt > 0) {
    lt_s = pad(lt % 24,2) + ":"  + lt_s;
    lt = Math.floor(lt / 24);
  }
  if(lt > 0) {
    lt_s = lt + "d " + lt_s;
  }
  return lt_s;
}



// $$$$$$$\  $$\    $$\ $$$$$$$\  
// $$  __$$\ $$ |   $$ |$$  __$$\ 
// $$ |  $$ |$$ |   $$ |$$ |  $$ |
// $$ |  $$ |\$$\  $$  |$$$$$$$  |
// $$ |  $$ | \$$\$$  / $$  __$$< 
// $$ |  $$ |  \$$$  /  $$ |  $$ |
// $$$$$$$  |   \$  /   $$ |  $$ |
// \_______/     \_/    \__|  \__|
                               
                               
                               



function DvrStatusDirective() {
  return function($scope, $element, $attrs) {
    console.log($element.css('width'));
    $scope.$watch($attrs.dvrStatus, function(value) {
      console.log(value);
    });
  }
}







// $$\   $$\ $$\             $$\                                   
// $$ |  $$ |\__|            $$ |                                  
// $$ |  $$ |$$\  $$$$$$$\ $$$$$$\    $$$$$$\   $$$$$$\  $$\   $$\ 
// $$$$$$$$ |$$ |$$  _____|\_$$  _|  $$  __$$\ $$  __$$\ $$ |  $$ |
// $$  __$$ |$$ |\$$$$$$\    $$ |    $$ /  $$ |$$ |  \__|$$ |  $$ |
// $$ |  $$ |$$ | \____$$\   $$ |$$\ $$ |  $$ |$$ |      $$ |  $$ |
// $$ |  $$ |$$ |$$$$$$$  |  \$$$$  |\$$$$$$  |$$ |      \$$$$$$$ |
// \__|  \__|\__|\_______/    \____/  \______/ \__|       \____$$ |
//                                                       $$\   $$ |
//                                                       \$$$$$$  |
//                                                        \______/ 

function vname(name) {
  return name.replace(/\//g, "_").replace(/\./g, "_");
}


function HistoryController($scope, $http) {
  $scope.loading_history = true;

  $scope.load = function() {
    $http.get("/flussonic/api/history").success(function(reply) {
      $scope.loading_history = false;
      reply.sort(function(a,b) {return a.name > b.name ? 1 : a.name == b.name ? 0 : -1; });
      $scope.history = reply;

      for(var i = 0; i < reply.length; i++) {
        reply[i].vname = vname(reply[i].name);
        reply[i].total_bytes_s = format_bytes(reply[i].total_bytes);
        reply[i].total_view_time_s = format_seconds(reply[i].total_view_time);

        $http.get("/flussonic/api/history", {params : {media : reply[i].name}}).success(function(resp) {
          var one_media = null;
          for(var j = 0; j < $scope.history.length; j++) {
            if($scope.history[j].name == resp.name) {
              one_media = $scope.history[j];
              break;
            }
          }
          if(one_media && resp.pulse) {
            one_media.pulse = resp.pulse;
          }

          if(one_media && resp.countries) {
            var c = {};
            for(var k in resp.countries) {
              if(resp.countries[k] && resp.countries[k].total_bytes) {
                c[k] = resp.countries[k].total_clients;
              }
            }
            one_media.countries = c;
          } else {
            one_media.countries = {};
          }
        });
      }
    });    
  }

  $scope.load();
}


function WorldMapDirective() {
  function hide($element) {
    $($element).html("");
  }

  function show($scope, $element, $attrs) {
    var visits = $scope.$eval($attrs.worldMap) || {};
    hide($element);
    $($element).vectorMap({
      map: 'world_mill_en',
      series: {
        regions: [{
          values: visits,
          scale: ['#C8EEFF', '#0071A4'],
          normalizeFunction: 'polynomial'
        }]
      },          
      onRegionLabelShow: function(e, el, code){
        el.html(el.html()+' (Visits: '+(visits[code] || 0)+')');
      }          
    });

  }


  return function($scope, $element, $attrs) {
    var el = $($element);
    var visible = $($element).is(":visible");

    if(visible) {
      show($scope, $element, $attrs);
    }
    var panel = $($element).parents(".panel-collapse")[0];
    $(panel).on("shown.bs.collapse", function() {
      show($scope, $element, $attrs);
    }).on("hidden.bs.collapse", function() {
      hide($element);
    });
  }
}







// $$\    $$\  $$$$$$\  $$$$$$$\  
// $$ |   $$ |$$  __$$\ $$  __$$\ 
// $$ |   $$ |$$ /  $$ |$$ |  $$ |
// \$$\  $$  |$$ |  $$ |$$ |  $$ |
//  \$$\$$  / $$ |  $$ |$$ |  $$ |
//   \$$$  /  $$ |  $$ |$$ |  $$ |
//    \$  /    $$$$$$  |$$$$$$$  |
//     \_/     \______/ \_______/ 


function VodUploadDirective() {
  return function($scope, $element, $attrs) {
    var vodUpload = $attrs.vodUpload;
    var submit_button = $element.find("button[type='submit']");
    var progress_bar =  $element.find(".progress-bar");
    var file_selector =  $element.find("input[type='file']");
    var upload_form = $element.find("form");
    
    file_selector.on("change", function(evt) {
      if(this.files.length == 0) {
        submit_button.attr("disabled", true);
        return;
      } 
      submit_button.attr("disabled", null);
      var size = 0;
      for(var i = 0; i < this.files.length; i++) {
        size += this.files[i].size;
      }

      var size_mb = (Math.round(size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
      // $("#upload-info").html("Upload "+size_mb);
    });
    
    upload_form.submit(function() {
      progress_bar.show().css('width', "0%");
      var vod = $scope.$eval(vodUpload);
      var xhr = new XMLHttpRequest();
      var fd = this["getFormData"] ? this.getFormData() : new FormData(this);
      submit_button.attr("disabled", true);
      file_selector.attr("disabled", true);
      
      xhr.upload.addEventListener("progress", function(event) {
        if(event.lengthComputable) {
          var progress = Math.round(100*event.loaded / event.total);
         progress_bar.css("width", progress + "%");
        }
      }, false);

      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          submit_button.attr("disabled", null);
          file_selector.attr("disabled", null);
          progress_bar.hide();
          $scope.$eval(function() {
            $scope.load(vod, vod.subpath);
          })
        }
      }

      xhr.open("POST", this.action);
      xhr.setRequestHeader("Cache-Control", "no-cache");
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      xhr.setRequestHeader("X-Prefix", vod.prefix);
      xhr.setRequestHeader("X-Path", vod.path);
      xhr.setRequestHeader("X-Subpath", vod.subpath);
      
      var file_sizes = [];
      var files = $element.find("input").prop("files");
      for (var i = 0; i < files.length; i++) {
        var f = files[i];
        file_sizes.push(f.name + ":" + f.size);
      }
      xhr.setRequestHeader("X-File-Sizes", file_sizes.join('|'));
      xhr.send(fd);

      return false;
    });
    
    // xhr.upload.addEventListener("progress", function(event) {
    //   if(event.lengthComputable) {
    //     var progress = Math.round(100*event.loaded / event.total);
    //     $("#file-progress").css("width", progress + "%");
    //     // $("#upload-info").html(""+event.loaded + ' / ' + event.total);
    //   }
    // }, false);

  }
}
                               
                               
function VodController($scope, $http) {
  $http.get("/flussonic/api/get_config").success(function(reply) {
    var vods = [];
    for(var i = 0; i < reply.config.length; i++) {
      if(reply.config[i].entry == "file") {
        for(var j = 0; j < reply.config[i].value.paths.length; j++) {
          var path = reply.config[i].value.paths[j].value;
          var protocol = path.match(/([^:]+)/)[1];
          if(protocol == "swift" || protocol == "swifts") {
            var auth_string = path.match(/\/\/(.+)\@/)[1];
            var auth = {};
            auth_string.split("&").forEach(function(v) {
              var pair = v.split("=");
              auth[pair[0]] = pair[1];
            });
            var visible_path = path.replace(/\/\/.+\@/, "//"+auth["user"]+"@");
          } else {
            var visible_path = path.replace(/\/\/.+\@/, "//");
          }
          vods.push({prefix : reply.config[i].value.prefix, path : path, visible_path : visible_path});
        }
      }
    }
    $scope.vods = vods;
  });

  $scope.load = function(index, path) {
    var vod = index.prefix ? index : $scope.vods[index];
    vod.loading = true;
    $http({url : "/flussonic/api/list_files", method : "GET", params : {prefix : vod.prefix, path : vod.path, subpath : path}}).
    success(function(reply) {
      
      vod.files = [];
      vod.dirs = [];
      vod.parents = [];
      vod.subpath = path;
      
      var root_name = vod.path.split('/').pop();
      vod.dir_name = root_name;
      
      var path_parts = path.split('/').filter(ok_s);
      if (path_parts.length > 0){
        vod.dir_name = path_parts.pop();
        path_parts.unshift('$root');
        path_parts
          .reduce(function(acc,x){
            var _sub_path = acc + (x === '$root' ? '' : x);
            vod.parents.push({type: "directory",
                              name: x === '$root' ? root_name : x,
                              prefix: vod.prefix,
                              path: vod.path,
                              subpath: _sub_path});
            return _sub_path[_sub_path.length-1] === '/' 
              ? _sub_path
              : _sub_path + '/';
          },'/');
      }        
      
      for(var i = 0; i < reply.files.length; i++) {
        var f = reply.files[i];
        f.prefix = vod.prefix;
        f.path = vod.path;
        f.subpath = path + (path == "/" ? "" : "/") + f.name;
        if(f.type == "file") {
          f.play_path = vod.prefix + path + (path == "/" ? "" : "/") + f.name;
          vod.files.push(f);
        } else {
          vod.dirs.push(f);
        }
      }
      vod.loading = false;
    });
  }

  $scope.remove = function(vod, file) {
    $http({url : "/flussonic/api/remove_file", method : "POST", params : {prefix : file.prefix, dir : file.path, subpath : file.subpath}}).
    success(function(reply) {
      for(var i = 0; i < vod.files.length; i++) {
        if(vod.files[i].name == file.name) {
          vod.files.splice(i,1);
          break;
        }
      }
    })
  }
  

  $scope.play = function(file) {
    PlayStream(file.play_path, $http);
  }
  
  $scope.subdir = function(index, dir) {
    $scope.load(index, dir.subpath);
  }

  $scope.create_dir = {
    name_regex: /(?:[\w-]+\/?)+/,
    show_modal: function(index, vod){
      $scope.create_dir.name = '';
      $scope.create_dir.vod = vod;
      $scope.create_dir.index = index;
    },
    confirm: function() {
      var origin = $scope.create_dir.vod.subpath;
      var subpath = origin[origin.length-1] === '/'
          ? origin + $scope.create_dir.name
          : origin + '/' + $scope.create_dir.name;
      $scope.load($scope.create_dir.index, subpath);
    }
  };
}






function watchers_count(root) {
  if(!root) {
    root = $(document.getElementsByTagName('body'));
  }
    
  var watchers = 0;

  var f = function (element) {
      if (element.data().hasOwnProperty('$scope')) {
          watchers += (element.data().$scope.$$watchers || []).length;
      }

      angular.forEach(element.children(), function (childElement) {
          f($(childElement));
      });
  };

  f(root);

  return watchers;
}













function FluHelpDirective() {
  return {
    template : "<a href='#' class='icon-help glyphicon glyphicon-question-sign'></a>",
    replace : true,
    compile: function(element, attrs) {
      var popoverText = $(element.context).html();
      return function(scope, element, attrs) {
        $(element).attr("data-toggle", "popover");
        $(element).popover({content : popoverText, html : true}).click(function(){return false;});
      }
    }
  }
}







function ConfigController($scope, $http, $flu, $fluConfig, $timeout) {
  $scope.config = [];
  $scope.loading_config = true;

  $scope.loglevels = ["debug", "info", "error"];
  $scope.config_save_error = false;

  $scope.$on("flu:server.info", function(e, message) {
    $scope.has_dvr = message.dvr;
  });

  $flu.request("server");

  $scope.config = $fluConfig;


  $scope.save = function() {
    if(!window.confirm("You can break your config with old UI. Do you want to use old code?")) {
      return;
    }
    $(".save-config-btn").button("loading");
    $scope.config.save().success(function() {
      $timeout(function() { 
        $(".save-config-btn").button("reset");
        $scope.config_save_error = false;
      }, 500);
    }).error(function(data, status) {
      $timeout(function() { 
        $(".save-config-btn").button("reset");
        $scope.config_save_error = status;
      }, 500);
    });
  }

  $scope.cancel = function() {
    // $scope.text_config = null;
    // $scope.show_text_config = false;
    $scope.config_save_error = false;
    $scope.config_load_error = false;
    $scope.loading_config = true;
    $scope.config.load().then(function() {
      $scope.loading_config = false;
      $scope.config_load_error = false;
    }, function(err) {
      $scope.loading_config = false;
      $scope.config_load_error = err.status;
    }); 
  }
  $scope.load = $scope.cancel;
  $scope.load();
}





function FluConfigFactory($http) {
  var config = new FluConfig();

  config.load = function() {
    this.text_config = null;
    this.show_text_config = false;
    var $this = this;
    var defer = $http.get("/flussonic/api/get_config").success(function(reply) {
      $this.read(reply.config);
    });

    $http.get("/flussonic/api/get_schedule_names").success(function(schedules){
      if(schedules.length > 0) $this.data.is_ad_injector = true;
      $this.data.ad_schedule_names = schedules;
    });
    return defer;
  }

  config.save = function() {
    return $http.post("/flussonic/api/save_config", this.serialized());
  }

  return config;
}
