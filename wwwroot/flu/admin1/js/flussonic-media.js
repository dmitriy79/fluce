
// $$\                          
// $$ |                         
// $$ |      $$$$$$\   $$$$$$\  
// $$ |     $$  __$$\ $$  __$$\ 
// $$ |     $$ /  $$ |$$ /  $$ |
// $$ |     $$ |  $$ |$$ |  $$ |
// $$$$$$$$\\$$$$$$  |\$$$$$$$ |
// \________|\______/  \____$$ |
//                    $$\   $$ |
//                    \$$$$$$  |
//                     \______/ 


function MediaLogDirective($ws) {
  return function($scope, $element, $attrs) {
    $scope.name = $scope.$eval($attrs.mediaLog);

    $scope.limit = ($attrs.limit ? $scope.$eval($attrs.limit) : 0) || 20;
    if($attrs.limit && parseInt($attrs.limit) > 0) $scope.limit = $attrs.limit;

    $ws.send("log_media_start:"+$scope.name);

    $scope.$on("$destroy", function() {
      $ws.send("log_media_stop:"+$scope.name);
    });

    $scope.rows = [];


    function log(text) {
      while($scope.rows.length >= $scope.limit) {
        $scope.rows.splice(0,1);
      }
      $scope.rows.push(text);
      var t = $element[0];
      var autoscroll = (t.scrollTop == 0) || ( (t.scrollHeight - t.scrollTop) < 20);
      $element.text($scope.rows.join(""));
      if(autoscroll) {
        t.scrollTop = t.scrollHeight;      
      }
    }

    $scope.$on("flu:log.entry", function(e, msg) {
      if(msg.media == $scope.name) {
        log(msg.text);
      }
    })
  }
}


function MediaController($scope, $flu, $timeout, $http, $fluConfig) {
  $scope.total_sessions = 0;
  $scope.file_sessions = 0;
  $scope.stream_sessions = 0;
  $scope.requesting_stats = true;
  $scope.streams = [];
  $scope.stream_filter = {};
  $scope.stream_filter_s = "all";
  $scope.lives = [];
  $scope.vods = [];
  $scope.medias_with_clients = {};
  $scope.loading_media = true;

  $scope.config = $fluConfig;
  $scope.config_loaded = false;

  $scope.config_changed = false;

  if(window.admin_auth_token && window.admin_auth_token.indexOf("=ADM") > -1) {
    $scope.admin_auth_token = window.admin_auth_token;
  }

  


  $flu.request("server");
  $scope.$on("flu:server.info", function(e, message) {
    $scope.has_dvr = message.dvr;
    $scope.need_ffmpeg = !message.ffmpeg;
  });







//  $$$$$$\                       $$$$$$\  $$\           
// $$  __$$\                     $$  __$$\ \__|          
// $$ /  \__| $$$$$$\  $$$$$$$\  $$ /  \__|$$\  $$$$$$\  
// $$ |      $$  __$$\ $$  __$$\ $$$$\     $$ |$$  __$$\ 
// $$ |      $$ /  $$ |$$ |  $$ |$$  _|    $$ |$$ /  $$ |
// $$ |  $$\ $$ |  $$ |$$ |  $$ |$$ |      $$ |$$ |  $$ |
// \$$$$$$  |\$$$$$$  |$$ |  $$ |$$ |      $$ |\$$$$$$$ |
//  \______/  \______/ \__|  \__|\__|      \__| \____$$ |
//                                             $$\   $$ |
//                                             \$$$$$$  |
//                                              \______/ 


  var stopWatchingConfig = null;
  function startWatchingConfig() {
    true;
  }
  function startWatchingConfig() {
    $scope.config_changed = false;
    $scope.$watch("config", function(old, new_) {
        $timeout.cancel(stopWatchingConfig);
        stopWatchingConfig = $timeout(function(){
            $scope.config_changed = ($scope.config_text != new_.serialized());
            stopWatchingConfig = null;
        }, 400);
    }, true);
  }

  $scope.loadConfig = function () {
    $scope.config.load().then(function() {
      $scope.config_loaded = true;
      $scope.config_changed = true;
      $scope.config_text = $scope.config.serialized();

      var has_rtmp = !!$scope.config.data.rtmp;


      for(var i = 0; i < $scope.config.data.streams.length; i++) {
        var s = $scope.config.data.streams[i];
        var j = 0;
        while(j < $scope.streams.length && $scope.streams[j].name != s.name) j++;

        if(j == $scope.streams.length) {
          // No stream online, insert it exactly where it is in config
          $scope.streams.splice(i, 0, {
            name : s.name, vname : vname(s.name), type : "stream", is_stream : true,
            config : s, online : false, client_count : 0, rtmp : has_rtmp, original_name : s.name});
          updateFromConfig($scope.streams[i], s);
        } else if(j == i) {
          updateFromConfig($scope.streams[i], s);
          $scope.streams[i].rtmp = has_rtmp;
        } else {
          var old = $scope.streams[j];
          $scope.streams[j].rtmp = has_rtmp;
          $scope.streams.splice(j,1);
          $scope.streams.splice(i,0,old);
          updateFromConfig($scope.streams[i], s);
        }
      }

      for(var i = 0; i < $scope.config.data.lives.length; i++) {
        var l = $scope.config.data.lives[i];

        var j = 0;
        while(j < $scope.lives.length && $scope.lives[j].prefix != l.prefix) j++;

        if(j == $scope.lives.length) {
          l.show_options = true;
          $scope.lives.splice(i, 0, {
            prefix : l.prefix, config : l, streams : []
          });
        } else if(i != j) {
          var old = $scope.lives[j];
          $scope.lives.splice(j,1);
          $scope.lives.splice(i,0,old);
        }
      }

      for(var i = 0; i < $scope.config.data.vods.length; i++) {
        var v = $scope.config.data.vods[i];

        var j = 0;
        while(j < $scope.vods.length && $scope.vods[j].prefix != v.prefix) j++;

        if(j == $scope.vods.length) {
          v.show_options = true;
          $scope.vods.splice(i, 0, {
            prefix : v.prefix, config : v, files : []
          });
        } else if(i != j) {
          var old = $scope.vods[j];
          $scope.vods.splice(j,1);
          $scope.vods.splice(i,0,old);
        }
      }

      // if(!$scope.config_changed) {
      //   if(!stopWatchingConfig) {
      //     $timeout(startWatchingConfig, 10);
      //   }
      // }
    }, function(err) {
      $scope.config_loaded = false;
    }); 
  }

  $scope.reload = function() {
    window.location.reload();
  }

  $scope.save_config = function() {
    if(!window.confirm("You can break your config with old UI. Do you want to use old code?")) {
      return;
    }
    for(var i = 0; i < $scope.streams.length; i++) {
      if($scope.streams[i].config && $scope.streams[i].name != $scope.streams[i].config.name) {
        $scope.streams[i].name = $scope.streams[i].config.name;
      }
    }
    for(var i = 0; i < $scope.lives.length; i++) {
      if($scope.lives[i].config && $scope.lives[i].prefix != $scope.lives[i].config.prefix) {
        $scope.lives[i].prefix = $scope.lives[i].config.prefix;
      }
    }
    for(var i = 0; i < $scope.vods.length; i++) {
      if($scope.vods[i].config && $scope.vods[i].prefix != $scope.vods[i].config.prefix) {
        $scope.vods[i].prefix = $scope.vods[i].config.prefix;
      }
    }

    $(".save-config-btn").button("loading");

    $scope.config.save().success(function() {
      $timeout(function() { 
        $(".save-config-btn").button("reset");
        $scope.config_save_error = false;
        // $timeout(startWatchingConfig,10);
        $scope.loadConfig();
      }, 500);
    }).error(function(data, status) {
      $timeout(function() { 
        $(".save-config-btn").button("reset");
        $scope.config_save_error = status;
      }, 500);
    });
  }

  $scope.add_ingest_stream = function() {
    var i = $scope.config.data.streams.length;
    var s = $scope.config.add_ingest_stream();
    $scope.config.add_stream_url(s);

    s.name = "";
    $scope.streams.splice(i, 0, {
      name : s.name, type : "stream", is_stream : true, show_config : true,
      rtmp : !!$scope.config.data.rtmp,
      config : s, online : false, client_count : 0});
    updateFromConfig($scope.streams[i], s);    
  }

  $scope.remove_ingest_stream = function(i) {
    $scope.config.remove_ingest_stream(i);
    $scope.streams.splice(i,1);
  }



  $scope.add_live = function() {
    var l = $scope.config.add_live();
    l.show_options = true;
    $scope.lives.push({prefix : l.prefix, config : l, streams : [], show_config : true});
  }

  $scope.remove_live = function(i) {
    $scope.config.remove_live(i);
    $scope.lives.splice(i,1);    
  }


  $scope.add_vod = function() {
    var v = $scope.config.add_vod();
    v.show_options = true;
    $scope.vods.push({prefix : v.prefix, config : v, files : [], show_config : true});
  }

  $scope.remove_vod = function(i) {
    $scope.config.remove_vod(i);
    $scope.vods.splice(i,1);    
  }


  $scope.loadConfig();

  $scope.$on("flu:system.config_reloaded", $scope.loadConfig);

  function updateFromConfig(media, source) {
    media.dvr = !!source.dvr;
    media.hds = !source.hds_off;
    media.hls = !source.hls_off;
    media.dash = !source.dash_off;
    media.config = source;
    media.show_config = false;
    if(source.comment) media.comment = source.comment;
  }

  function updateFromStats(old, new_) {
    if(new_.bitrate) {
      old.bitrate = new_.bitrate + "k";
    } else {
      delete old["bitrate"];
    }

    if (new_.alive || new_.type == 'file') {
      old.client_count = new_.client_count;
      old.online = true;
    } else {
      old.online = !!new_.static;
    }

    // for offline replicated streams
    if (new_.offline) {
      old.dvr_replication = new_.dvr_replication;
      old.dvr_replication_running = new_.dvr_replication_running;
    }

    if(new_.type == "stream" || new_.type == "live") {
      var serverNow = (new Date().getTime()) - window.serverTimeDiffMs;
      old.lifetime = format_seconds(Math.floor((serverNow - new_.start_running_at)/1000));

      if(new_.ts_delay > 12000) {
        old.v_ts_delay = format_seconds(Math.round(new_.ts_delay / 1000));
        old.working = false;
      } else {
        old.v_ts_delay = "";
        old.working = new_.ts_delay != undefined;
      }
      if(new_.comment) {
        old.comment = new_.comment;
      }
      old.ts_delay = new_.ts_delay;
      old.v_retry_count = new_.retry_count > 0 ? new_.retry_count : "";
      if(old.v_retry_count == "" && new_.input_error_rate > 0) {
        old.v_retry_count = new_.input_error_rate + " drops/s";
      }

      // these checks for undefined need only to preserve first received values
      // for offline streams
      if (new_.hds != undefined) old.hds = new_.hds;
      if (new_.hls != undefined) old.hls = new_.hls;
      if (new_.rtmp != undefined) old.rtmp = !!new_.rtmp;
      if (new_.rtsp != undefined) old.rtsp = !!new_.rtsp;
      if (new_.dash != undefined) old.dash = !!new_.dash;
      if (new_.dvr_enabled != undefined) old.dvr = new_.dvr_enabled;

      old.dvr_replication = new_.dvr_replication;
      old.dvr_replication_running = new_.dvr_replication_running;
      old.media_info = new_.media_info;
      old.source_error = new_.source_error;
      old.remote = new_.remote;
      old.cluster_ingest = new_.cluster_ingest;
      old.url = new_.url;
    }
  }

  function compare_ip(ip1, ip2) {
    ip1 = ip1.split(".").map(function(i){ return parseInt(i,10);});
    ip2 = ip2.split(".").map(function(i){ return parseInt(i,10);});
    var k;
    for(var k = 0; k < ip1.length && k < ip2.length; k++) {
      if(ip1[k] < ip2[k]) return -1;
      if(ip1[k] > ip2[k]) return 1;
    }
    return 0;
  }





//  $$$$$$\    $$\                $$\               
// $$  __$$\   $$ |               $$ |              
// $$ /  \__|$$$$$$\    $$$$$$\ $$$$$$\    $$$$$$$\ 
// \$$$$$$\  \_$$  _|   \____$$\\_$$  _|  $$  _____|
//  \____$$\   $$ |     $$$$$$$ | $$ |    \$$$$$$\  
// $$\   $$ |  $$ |$$\ $$  __$$ | $$ |$$\  \____$$\ 
// \$$$$$$  |  \$$$$  |\$$$$$$$ | \$$$$  |$$$$$$$  |
//  \______/    \____/  \_______|  \____/ \_______/ 


  $scope.applyFilter = function(type) {
    if(!type) {
      $scope.stream_filter = {};
      $scope.stream_filter_s = "all";
    } else if(type == "failed") {
      $scope.stream_filter = {online : true, working : false};
      $scope.stream_filter_s = "failed";
    } else if(type == "online") {
      $scope.stream_filter = {online : true, working : true};
      $scope.stream_filter_s = "online";
    } else if(type == "offline") {      
      $scope.stream_filter = {online : false};
      $scope.stream_filter_s = "offline";
    }
  }


  function draw(medias, type) {
    var j = 0;
    if(type == "live" || type == "file") {
      medias.sort(function(a,b) {return a.name > b.name ? 1 : a.name == b.name ? 0 : -1; });    
    }
    var names = {};

    if(type == "stream") {
      for(var i = 0; i < medias.length; i++) {
        if(medias[i].prefix) continue;
        var j = 0;
        var m = medias[i];
        while(j < $scope.streams.length && $scope.streams[j].name != m.name) j++;
        if(j == $scope.streams.length) {
          $scope.streams.push({
            name : m.name, vname : vname(m.name), type : "stream", is_stream : true,
            online : !!m.static, client_count : 0, original_name : m.name});
        }
        names[m.name] = true;
        m.type = "stream";
        updateFromStats($scope.streams[j], m);        
      }
      var i = 0;
      while(i < $scope.streams.length) {
        if(!names[$scope.streams[i].name]) {
          if($scope.streams[i].prefix || ($scope.config_loaded && i >= $scope.config.data.streams.length)) {
            $scope.streams.splice(i,1);
          } else {
            $scope.streams[i].online = false;
            i++;
          }
        } else {
          i++;          
        }
      }
    }

    if(type == "live") {
      for(var i = 0; i < $scope.lives.length; i++) {
        for(var j = 0; j < $scope.lives[i].streams.length; j++) {
          $scope.lives[i].streams[j].online = false;
        }
      }

      for(var i = 0; i < medias.length; i++) {
        var j = 0;
        var m = medias[i];

        if(!m.prefix) continue;

        m.type = "live";

        while(j < $scope.lives.length && $scope.lives[j].prefix != m.prefix) j++;

        if(j == $scope.lives.length) {
          // Yes, we put it to _streams_ because no live is waiting for us
          $scope.streams.push({
            name : m.name, vname : vname(m.name), type : "stream", is_stream : true,
            client_count : 0, original_name : m.name, prefix : m.prefix});
          updateFromStats($scope.streams[$scope.streams.length - 1], m);
        } else {
          var k = 0;
          var l = $scope.lives[j];
          while(k < l.streams.length && l.streams[k].name < m.name) k++;
          if(k >= l.streams.length || l.streams[k].name > m.name) {
            l.streams.splice(k, 0, {
              name : m.name, vname : vname(m.name), type : "live", is_stream : true,
              client_count : 0, original_name : m.name
            });
          }
          updateFromStats(l.streams[k], m);
        }
      }

      for(var i = 0; i < $scope.lives.length; i++) {
        var j = 0;
        while(j < $scope.lives[i].streams.length) {
          if($scope.lives[i].streams[j].online) j++;
          else $scope.lives[i].streams.splice(j,1);
        }
      }

    }



    if(type == "file") {
      for(var i = 0; i < $scope.vods.length; i++) {
        for(var j = 0; j < $scope.vods[i].files.length; j++) {
          $scope.vods[i].files[j].online = false;
        }
      }

      for(var i = 0; i < medias.length; i++) {
        var j = 0;
        var m = medias[i];

        m.type = "file";

        while(j < $scope.vods.length && $scope.vods[j].prefix != m.prefix) j++;

        if(j == $scope.vods.length) {
          // Yes, we put it to _streams_ because no live is waiting for us
          $scope.streams.push({
            name : m.name, vname : vname(m.name), type : "file", is_stream : false,
            hds : true, hls : true, rtmp : true,
            online : true, client_count : 0, original_name : m.name, prefix : m.prefix});
          updateFromStats($scope.streams[$scope.streams.length - 1], m);
        } else {
          var k = 0;
          var v = $scope.vods[j];
          while(k < v.files.length && v.files[k].name < m.name) k++;
          if(k >= v.files.length || v.files[k].name > m.name) {
            v.files.splice(k, 0, {
              name : m.name, vname : vname(m.name), type : "file", is_stream : false,
              hds : true, hls : true, rtmp : true,
              online : true, client_count : 0, original_name : m.name
            });
          }
          updateFromStats(v.files[k], m);
        }
      }

    }

    // $scope.file_sessions = 0;
    // $scope.stream_sessions = 0;
    // for(j = 0; j < $scope.medias.length; j++) {
    //   if($scope.medias[j].type == "file") {
    //     $scope.file_sessions += $scope.medias[j].client_count;
    //   } else {
    //     $scope.stream_sessions += $scope.medias[j].client_count;
    //   }
    // }
    // $scope.total_sessions = $scope.file_sessions + $scope.stream_sessions;
  }



// $$\      $$\ $$\                     
// $$$\    $$$ |\__|                    
// $$$$\  $$$$ |$$\  $$$$$$$\  $$$$$$$\ 
// $$\$$\$$ $$ |$$ |$$  _____|$$  _____|
// $$ \$$$  $$ |$$ |\$$$$$$\  $$ /      
// $$ |\$  /$$ |$$ | \____$$\ $$ |      
// $$ | \_/ $$ |$$ |$$$$$$$  |\$$$$$$$\ 
// \__|     \__|\__|\_______/  \_______|



  function request() {
    $flu.request("streams");
    $flu.request("files");
  }

  if(!$scope.request_timer) {
    $scope.request_timer = $timeout(request, 1);
  }

  $scope.$on("flu:stream.list", function(e,message) {
    window.serverTimeDiffMs = (new Date().getTime()) - message.now_ms;

    $scope.loading_media = false;
    draw(message.streams, "stream");
    draw(message.streams, "live");
    if($scope.request_timer) $timeout.cancel($scope.request_timer);
    $scope.request_timer = null;
    if($scope.requesting_stats) {
      $scope.request_timer = $timeout(request, 2000);
    }
  });
  $scope.$on("flu:file.list", function(e,message) {
    draw(message.files, "file");
  });
  $scope.$on("$destroy", function() {
    $scope.requesting_stats = false;
    $scope.medias_with_clients = {};
  });

  $scope.$on("flu:user.list", function(e,msg) {
    draw_clients(msg)
  });

  function draw_clients(msg) {
    var m = $scope.medias_with_clients[msg.name];
    if(!m) return;

    var new_sessions = {};

    if(!m.clients) m.clients = [];
    var old_sessions = {};
    for(i = 0; i < m.clients.length; i++) {
      old_sessions[m.clients[i].id] = m.clients[i];
    }

    for(i = 0; i < msg.sessions.length; i++) {
      var sess = msg.sessions[i]
      sess.duration = format_seconds(sess.duration / 1000);
      sess.bytes = format_bytes(sess.bytes_sent);
      if(old_sessions[sess.id]) {
        old_sessions[sess.id].duration = sess.duration;
        old_sessions[sess.id].bytes = sess.bytes;
      } else {
        m.clients.push(sess);
      }
      new_sessions[sess.id] = true;
    }

    i = 0;
    while(i < m.clients.length) {
      if(!new_sessions[m.clients[i].id]) {
        m.clients.splice(i,1);
      } else {
        i++;
      }
    }

    m.clients.sort(function(a,b) { return compare_ip(a.ip, b.ip); });

    if($scope.medias_with_clients[m.name]) {
      m.clients_timer = $timeout(function() { get_clients(m); }, 2000);
    } else {
      $scope.hide_clients(m);
    }
  }

  $scope.show_pulse = function(media) {

  }

  $scope.play_stream = function(media) {
    PlayStream(media.name, $http);
  }

  $scope.show_dvr_status = function(media) {
    var div = $(".dvr-"+media.vname);
    if(media.show_dvr) {
      media.show_dvr = false;
      div.html("");
      return;
    }
    media.show_dvr = true;

    var t = new Date();

    div.showDVR(media.name, {play_function : function(stream, url) {
      PlayStream(url, $http, stream);
    }});

    // $http.get("/flussonic/api/dvr_status/"+(t.getYear()+1900)+"/"+(t.getMonth()+1)+"/"+t.getDate()+"/"+media.name).
    // success(function(r) {
    //   media.dvr_status = r;


    // });
  }

  function get_clients(media) {
    if(media.clients_timer) $timeout.cancel(media.clients_timer);
    $flu.request("sessions?name="+media.name);
  }

  $scope.show_clients = function(media) {
    if(media.show_clients) {
      return $scope.hide_clients(media);
    }
    if(!media.clients) media.clients = [];
    if(media.clients_timer) $timeout.cancel(media.clients_timer);
    $scope.medias_with_clients[media.name] = media;
    media.clients_timer = $timeout(function() {get_clients(media); }, 1);
    media.show_clients = true;
  }

  $scope.hide_clients = function(media) {
    delete $scope.medias_with_clients[media.name];
    if(media.clients_timer) $timeout.cancel(media.clients_timer);
    media.show_clients = false;
    delete media["clients_timer"];
    delete media["clients"];
  }

  $scope.restart_stream = function(stream) {
    $http.post("/flussonic/api/stream_restart/"+stream.name);
  }
}
