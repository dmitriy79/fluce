




function fluPlayerDirective() {
  function link($scope, $element, $attrs) {
    var original_url = $scope.$eval($attrs.fluPlayer);

    if(!original_url) {
      console.log("must set url for flu-player");
      return false;
    }

    if(!$scope.stream.vname && $scope.stream.name) {
      console.log("must set vname for stream ",$scope.stream.name);
      return false;
    }

    var id = "video_"+$scope.stream.vname.replace("-", "_");

    var userAgent = window.navigator.userAgent;
    var hls = userAgent.indexOf("Safari") != -1 && (userAgent.indexOf("Chrome") == -1 || userAgent.indexOf("Android") != -1);
    var http_port = window.flu_http_port ? ":" + window.flu_http_port : "";


    function prepareUrl(url) {
      if(url.indexOf("http://") == -1 && url.indexOf("https://") == -1 && url.indexOf("rtsp://") == -1 && url.indexOf("rtmp://") == -1) {
        url = "http://" + window.location.hostname + http_port + url;
      }
      if(hls) {
        if(url.indexOf("manifest.f4m") == -1 && url.indexOf(".m3u8") == -1) url +=  "/index.m3u8";
      } else {
        if(url.indexOf("manifest.f4m") == -1 && url.indexOf(".m3u8") == -1 && url.indexOf("rtmp://") == -1) url +=  "/manifest.f4m";
      }
      return url;
    }

    var url = prepareUrl(original_url);

    function updateTime(time) {
      if(!time) return
      var utc = $scope.stream.relative_to_utc($scope.stream.start_play_time, time);
      if($scope.stream.utc != utc) {
        $scope.$apply(function() {
          $scope.stream.utc = utc;
        });
      }
    }

    if(hls) {
      $element.html("<video src='"+url+"' id='"+id+"' width=100% height=100% controls autoplay></video>");

      $scope.timer = setInterval(function() {
        updateTime($scope.player.currentTime);
      }, 1000);
    } else {
      $element.html("<div style='width:100%; height: 100%' id='"+id+"'></div>");

      var flashvars = {
        src : url,
        plugin_hls : "/flu/HLSDynamicPlugin.swf",
        javascriptCallbackFunction : 'onFluPlayerSmpEvent',
        autoPlay: true
      };
      var player = "StrobeMediaPlayback";
      // var player = "GrindPlayer";

      window["smp_player_onMeta_"+id] = function(evt) {
        if(evt.utc) {
          $scope.$apply(function() {
            console.log("onmeta",evt.utc);
            $scope.stream.utc = evt.utc;
          });          
        }
      }

      window["smp_player_onTimeChange_"+id] = updateTime;

      var paramObj = {allowScriptAccess : "always", allowFullScreen : "true", allowNetworking : "all"};
      swfobject.embedSWF("/flu/"+player+".swf", id, 640, 480, "10.3", "/flu/expressInstall.swf",
        flashvars, paramObj, {name: id}, function() {
          $scope.player = $element.find("#"+id)[0];
      });
    }

    $scope.$on("playerSeek", function(e, t) {
      if(!$scope.player) return;
      if(hls) {
        $scope.player.currentTime = t;
      } else {
        $scope.player.seek(t);
      }
    });

    $scope.$on("$destroy", function() {
      if($scope.timer) {
        clearTimeout($scope.timer);
        $scope.timer = null;
      }
      delete window["smp_player_onMeta_"+id];
      delete window["smp_player_onTimeChange_"+id];
    });
    $scope.player = $element.find("#"+id)[0];
  
    $scope.$watch($attrs.fluPlayer, function(n, old) {
      if(n != old) {
        var url = prepareUrl(n, hls);
        if(hls) {
          $scope.player.src = url;
        } else {
          if($scope.player && $scope.player.setMediaResourceURL) {
            $scope.player.setMediaResourceURL(url);
          }
        }
      }
    });

  }

  return {
    link : link
  }
}

function onFluPlayerSmpEvent(id, evt, info) {
  switch(evt) {
    case "onJavaScriptBridgeCreated":
      var player = document.getElementById(id);      
      player.addEventListener("onMetaData", "smp_player_onMeta_"+id);
      player.addEventListener("currentTimeChange", "smp_player_onTimeChange_"+id);
      break;
    case "timeupdate":
      break;
    case "timeChange":
      break;
    default:
  }
}


angular.module("flu.player", []).
directive("fluPlayer", fluPlayerDirective);


