

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




function FluConfig() {
  this.data = {};
  return this;
}


FluConfig.prototype = {
  read: function(reply) {
    this.j0_to_j2(this.data, reply);
    this.j2_to_j1(this.data);
  },

  read_to_j2: function(reply) {
    this.j0_to_j2(this.data, reply);
  },

  read_config: function(config, reply) {
    this.j0_to_j2(config, reply);
    this.j2_to_j1(config);
  },

  add_http: function() {
    var h = "";
    this.data.http.push(h);
    return h;
  },

  remove_http: function(i) {
    this.data.http.splice(i,1);
  },

  add_https: function() {
    var h = "";
    this.data.https.push(h);
    return h;
  },

  remove_https: function(i) {
    this.data.https.splice(i,1);
  },

  add_whitelist_ip: function() {
    var ip = "";
    this.data.api_allowed_from.push(ip);
    return ip;
  },

  remove_whitelist_ip: function(i) {
    this.data.api_allowed_from.splice(i,1);
  },

  add_notify: function() {
    var n = "";
    this.data.notifies.push(n);
    return n;
  },

  remove_notify: function(i) {
    this.data.notifies.splice(i,1);
  },

  add_script: function() {
    var s = {};
    var key = "zzzzzzzz" + (new Date()).getTime();
    this.data.web_scripts[key] = s;
    return s;
  },

  remove_script: function(i) {
    delete this.data.web_scripts[i];
  },

  add_proxy: function() {
    var s = {};
    var key = "zzzzzzzz" + (new Date()).getTime();
    this.data.http_proxies[key] = s;
    return s;
  },

  remove_proxy: function(i) {
    delete this.data.http_proxies[i];
  },

  add_ingest_stream: function() {
    var s = {urls : [], is_stream : true, static : true, transcoder : {},
      dvr : {}, auth : {}, coordinates : {}, meta : []};
    this.data.streams.push(s);
    this.data.stream_count++;
    return s;
  },

  remove_ingest_stream: function(i) {
    this.data.streams.splice(i,1);
    this.data.stream_count--;
  },

  add_stream_url: function(s) {
    var u = {url:""};
    s.urls.push(u);
    return u;
  },

  remove_stream_url: function(s,i) {
    s.urls.splice(i,1);
  },

  remove_push: function(s,i) {
    s.pushes.splice(i,1);
  },

  add_push: function(s) {
    if(!s.pushes) s.pushes = [];
    var p = "";
    s.pushes.push(p);
    return p;
  },

  add_live: function() {
    var l = {prefix : "", transcoder : {}, is_live : true,
      dvr : {}, auth : {}, coordinates : {}, meta : []};
    this.data.lives.push(l);
    this.data.live_count++;
    return l;
  },

  remove_live: function(i) {
    this.data.lives.splice(i,1);    
    this.data.live_count--;
  },

  add_vod: function() {
    var v = {paths : [], auth : {}, cache : {}, segment_cache : {}};
    this.data.vods.push(v);
    this.data.vod_count++;
    return v;
  },

  remove_vod: function(i) {
    this.data.vods.splice(i,1);
    this.data.vod_count--;
  },

  add_vod_path: function(v) {
    var p = {url:""};
    v.paths.push(p);
    return p;
  },

  remove_vod_path: function(v,i) {
    v.paths.splice(i,1);
  },

  add_cache: function() {
    var key = "zzzzzzzz" + (new Date()).getTime();
    var c = {name: "", key: key};
    this.data.caches[key] = c;
    this.data.cache_count++;
    return c;
  },

  remove_cache: function(i) {
    if(this.data.caches[i]) {
      this.data.cache_count--;    
    }
    delete this.data.caches[i]; 
  },

  serialized: function() {
    return this.serialize_config(this.data);
  }
};




// $$$$$$$\                                          $$\           $$\ $$\                     
// $$  __$$\                                         \__|          $$ |\__|                    
// $$ |  $$ | $$$$$$\   $$$$$$$\  $$$$$$\   $$$$$$\  $$\  $$$$$$\  $$ |$$\ $$$$$$$$\  $$$$$$\  
// $$ |  $$ |$$  __$$\ $$  _____|$$  __$$\ $$  __$$\ $$ | \____$$\ $$ |$$ |\____$$  |$$  __$$\ 
// $$ |  $$ |$$$$$$$$ |\$$$$$$\  $$$$$$$$ |$$ |  \__|$$ | $$$$$$$ |$$ |$$ |  $$$$ _/ $$$$$$$$ |
// $$ |  $$ |$$   ____| \____$$\ $$   ____|$$ |      $$ |$$  __$$ |$$ |$$ | $$  _/   $$   ____|
// $$$$$$$  |\$$$$$$$\ $$$$$$$  |\$$$$$$$\ $$ |      $$ |\$$$$$$$ |$$ |$$ |$$$$$$$$\ \$$$$$$$\ 
// \_______/  \_______|\_______/  \_______|\__|      \__| \_______|\__|\__|\________| \_______|
                                                                                            
                                                                                            
                                                                                            
FluConfig.prototype.j0_to_j2 = function(config, raw_config) {


  var i;
  config.http = [];
  config.https = [];
  config.admin_http = [];
  config.admin_https = [];
  config.auth = {};
  config.notifies = [];
  config.auth_backends = [];
  config.web_scripts = {};
  config.http_proxies = {};
  config.view_auth = {};
  config.edit_auth = {};
  config.api_allowed_from = [];
  config.includes = [];

  config.streams = [];
  config.dynamics = [];
  config.sources = [];
  config.peers = {};
  config.lives = [];
  config.vods = [];
  config.caches = {};
  config.cache_count = 0;
  config.dvrs = {};
  config.plugins = {};

  var web_scripts_count = 0;
  var http_proxies_count = 0;
  var plugins_count = 0;
  var dvrs_count = 0;
  var peers_count = 0;
  for(i = 0; i < raw_config.length; i++) {
    var e = raw_config[i];
    if(e.entry == "http") {
      config.http.push(e.value);
    } else if(e.entry == "https") {
      config.https.push(e.value);
    } else if(e.entry == "admin_http") {
      config.admin_http.push(e.value);
    } else if(e.entry == "admin_https") {
      config.admin_https.push(e.value);
    } else if(e.entry == "notify") {
      if(e.value.sink) {
        config.notifies.push(e.value);
      } else if(typeof e.value === "string") {
        config.notifies.push("" + e.value);
      }
    } else if(e.entry == "auth_backend") {
      config.auth_backends.push(e.value);
    } else if(e.entry == "web_script") {
      web_scripts_count = web_scripts_count + 1;
      var extra = {};
      if(e.value.extra) for(var j = 0; j < e.value.extra.length; j++) {
        extra[e.value.extra[j].key] = e.value.extra[j].value;
      }
      e.value.extra = extra;
      if(!e.value.position) e.value.position = web_scripts_count;
      config.web_scripts["" + e.value.prefix] = e.value;
    } else if(e.entry == "http_proxy") {
      http_proxies_count = http_proxies_count + 1;
      var extra = {};
      if(e.value.extra) for(var j = 0; j < e.value.extra.length; j++) {
        extra[e.value.extra[j].key] = e.value.extra[j].value;
      }
      e.value.extra = extra;
      if(!e.value.position) e.value.position = http_proxies_count;
      config.http_proxies["" + e.value.prefix] = e.value;
    } else if(e.entry == "stream") {
      e.value.is_stream = true;
      e.value.urls = this.read_urls(e.value.urls);
      config.streams.push(this.read_stream_options(e.value));
    } else if(e.entry == "dynamic") {
      e.value.is_live = true;
      e.value.is_stream = false;
      e.value.urls = this.read_urls(e.value.urls);
      config.dynamics.push(this.read_stream_options(e.value));
    } else if(e.entry == "live") {
      e.value.is_live = true;
      e.value.is_stream = false;
      e.value.urls = this.read_urls(e.value.urls);
      config.lives.push(this.read_stream_options(e.value));
    } else if(e.entry == "source") {
      config.sources.push(this.read_source_options(e.value));
    } else if(e.entry == "peer") {
      peers_count = peers_count + 1;
      var peer = {name: e.value.name};
      for(var j in e.value.options) {
        peer[j] = e.value.options[j];
      }
      peer.position = peers_count;
      config.peers[e.value.name] = peer;
    } else if(e.entry == "file") {
      config.vods.push(this.read_file_options(e.value));
    } else if(e.entry == "cache") {
      config.cache_count = config.cache_count + 1;
      var cache = this.read_cache_options(e.value);
      cache.position = config.cache_count;
      config.caches[cache.name] = cache;
    } else if(e.entry == "dvr") {
      var dvr = e.value;
      dvrs_count = dvrs_count + 1;
      dvr.position = dvrs_count;
      config.dvrs[dvr.name] = dvr;
    } else if(e.entry == "api_allowed_from") {
      e.values.forEach(function(ip){config.api_allowed_from.push(ip.value.replace("/32",""));});
    } else if(e.entry == "plugin") {
      plugins_count = plugins_count + 1;
      var plugin = {name: e.value.name};
      for(var j = 0; j < e.value.options.length; j++) {
        plugin[e.value.options[j].key] = e.value.options[j].value;
      }
      if(!e.value.options.position) plugin.position = plugins_count;
      config.plugins[e.value.name] = plugin;
    } else if(e.entry == "include") {
      config.includes.push(e.value);
    } else {
      config[e.entry] = e.value;
    }
  }
  this.read_auth_options(config.auth);
}


FluConfig.prototype.j2_to_j1 = function(config, raw_config) {
  if(!config.log_requests) config.log_requests = false;
  if(!config.auth_token) config.auth_token = "token";
  if(!config.auth.hasOwnProperty("autogenerate_token")) config.auth.autogenerate_token = "blank";

  for(var k in config.dvrs) {
    this.read_dvr_options(config.dvrs[k]);
    // config.dvrs = Object.keys(config.dvrs).map(function(k) { return config.dvrs[k]; })
  }
  for(var k in config.lives) {
    this.read_stream_options_j1(config.lives[k]);
    // config.lives = Object.keys(config.lives).map(function(k) { return config.lives[k]; })
    config.live_count = config.lives.length;
  }
  for(var k in config.streams) {
    this.read_stream_options_j1(config.streams[k]);
    // config.streams = Object.keys(config.streams).map(function(k) { return config.streams[k]; })
    config.stream_count = config.streams.length;
  }
  for(var k in config.dynamics) {
    this.read_stream_options_j1(config.dynamics[k]);
    // config.dynamics = Object.keys(config.dynamics).map(function(k) { return config.dynamics[k]; })
  }
  for(var k in config.vods) {
    // this.read_stream_options_j1(config.streams[k]);
    // config.vods = Object.keys(config.vods).map(function(k) { return config.vods[k]; })
    // config.vod_count = Object.keys(config.vods).length;
    config.vod_count = config.vods.length;
  }
}

FluConfig.prototype.cleaned_data = function() {
  var reply = {};
  for(var k in this.data) {
    if(Array.isArray(this.data[k]) && this.data[k].length == 0) continue;
    if(typeof this.data[k] == "object" && Object.keys(this.data[k]).length == 0) continue;
    if(k.indexOf("_count") != -1) continue;
    if(k == "auth") {
      var auth = this.cleaned_auth(this.data[k]);
      if(Object.keys(auth).length == 0) continue;
      reply.auth = auth;
      continue;
    }
    if(k == "http_proxies") {
      reply.http_proxies = {};
      for(var i in this.data.http_proxies) {
        reply.http_proxies[i] = this.cleaned_extra(this.data.http_proxies[i]);
      }
      continue;
    }
    reply[k] = this.data[k];
  }
  return reply;
}

FluConfig.prototype.cleaned_auth = function(auth) {
  var reply = {};
  for(var k in auth) {
    if(k.indexOf("_s") == k.length - 2) continue;
    reply[k] = auth[k];
  }
  return reply;
}

FluConfig.prototype.cleaned_extra = function(obj) {
  if(obj.extra && Object.keys(obj.extra).length > 0) return obj;
  var r = {};
  for(var k in obj) {
    if(k == "extra") continue;
    r[k] = obj[k];
  }
  return r;
}


FluConfig.prototype.read_urls = function(urls) {
  if(!urls) return [];
  return urls.map(function(u) {
    var o = {url: u.value};
    for(var k = 0; k < u.options.length; k++) {
      o[u.options[k][0]] = u.options[k][1];
    }
    return o;
  });
}


FluConfig.prototype.read_auth_options = function(a) {
  a.allowed_countries_s = a.allowed_countries ? a.allowed_countries.join(", ") : "";
  a.disallowed_countries_s = a.disallowed_countries ? a.disallowed_countries.join(", ") : "";
  a.domains_s = a.domains ? a.domains.join(", ") : "";
  // TODO: переделать здесь auth.extra на {} #2782
  if(Array.isArray(a.extra)) {
    var e = {};
    for(var i = 0; i < a.extra.length; i++) {
      e[a.extra[i].key] = a.extra[i].value;
    }
    a.extra = e;
  }
}

FluConfig.prototype.read_file_options = function(s) {
  if(!s.options.auth) s.options.auth = {};
  this.read_auth_options(s.options.auth);
  s.paths = this.read_urls(s.paths);

  if(s.options.segment_duration > 0) s.options.segment_duration = Math.round(s.options.segment_duration / 1000);

  if(s.options.segment_cache) s.options.segment_cache = this.read_cache_options(s.options.segment_cache);
  else s.options.segment_cache = {};
  if(s.options.cache) s.options.cache = this.read_cache_options(s.options.cache);
  else s.options.cache = {};
  s.options.prefix = s.prefix;
  s.options.paths = s.paths;
  return s.options;
}

FluConfig.prototype.read_source_options = function(s) {
  if(s.options.group_config) {
    for (var grp in s.options.group_config) {
      if(!s.options.group_config[grp].auth) s.options.group_config[grp].auth = {};
    }
  }
  if(s.options.cache) s.options.cache = this.read_cache_options(s.options.cache);
  else s.options.cache = {};
  return this.read_stream_options(s);
}

FluConfig.prototype.shorten_disk_size = function(value) {
  var t = parseInt(value,10);
  if(""+t != value) return value;
  value = t;

  if(value % 1073741824 == 0) {
    return Math.floor(value / 1073741824)+"G";
  } else if(value % 1048576 == 0) {
    return Math.floor(value / 1048576) + "M";
  } else if(value % 1024 == 0) {
    return Math.floor(value / 1024) + "K";
  }
}

FluConfig.prototype.serialize_time = function(s) {
  var t = parseInt(s,10);
  if(""+t != s) return s;

  if(t % 86400 == 0) {
    t = Math.floor(t / 86400) + "d";
  } else if(t % 3600 == 0) {
    t = Math.floor(t / 3600) + "h";
  } else if(t % 60 == 0) {
    t = Math.floor(t / 60) + "m";
  } else {
    t = t + "s";
  }
  return t;
}

FluConfig.prototype.read_cache_options = function(s) {
  if(s.time_limit > 0) {
    s.time_limit = this.serialize_time(s.time_limit);
  }
  if(s.disk_limit > 0) {
    s.disk_limit = this.shorten_disk_size(s.disk_limit);
  }
  return s;
}

FluConfig.prototype.read_dvr_options = function(s) {
  if(!s) return;

  if(s.dvr_limit > 0) {
    s.dvr_limit = this.serialize_time(s.dvr_limit);
  }
  if(s.disk_limit) {
    s.disk_limit += "%";
  }
  if(s.disk_space) {
    s.disk_space = this.shorten_disk_size(s.disk_space);
  }
  return s;
}



FluConfig.prototype.read_stream_options = function(s) {
  if(!s.options.auth) s.options.auth = {};
  this.read_auth_options(s.options.auth);

  if(!s.options.pushes) {
    s.options.pushes = [];
  }
  // Не будем добавлять пустой список групп, т.к. он может придти из флюссоника
  // if(!s.options.groups) {
  //   s.options.groups = [];
  // }
  this.read_dvr_options(s.options.dvr);


  if(s.options.segment_duration > 0) s.options.segment_duration = Math.round(s.options.segment_duration / 1000);
  

  if (s.options.prepush > 0) {
    s.options.prepush_duration = s.options.prepush;
  }

  // if(s.options.clients_timeout > 0) s.options.clients_timeout = Math.floor(s.options.clients_timeout / 1000);
  // if(s.options.source_timeout > 0) s.options.source_timeout = Math.floor(s.options.source_timeout);


  if(s.options.transcoder && s.options.transcoder.length > 0) {
    s.options.transcoder_s = this.serialize_transcoder(s.options.transcoder);
  } else {
    s.options.transcoder_s = undefined;
    s.options.transcoder = undefined;
  }


  s.options.coordinates = {};
  if(s.options.meta) {
    var i = 0;
    while(i < s.options.meta.length) {
      var k = s.options.meta[i][0];
      var v = s.options.meta[i][1];
      if(k == "coordinates") {
        var coord = v.split(" ");
        s.options.coordinates = {lat : coord[0], lng : coord[1]};
        s.options.meta.splice(i,1);
      } else if(k == "postal_address") {
        s.options.postal_address = v;
        s.options.meta.splice(i,1);
      } else if(k == "comment") {
        s.options.comment = v;
        s.options.meta.splice(i,1);
      } else {
        i++;
      }
    }
  } else {
    s.options.meta = [];
  }
  if(s.options.cache) s.options.cache = this.read_cache_options(s.options.cache);
  else s.options.cache = {};

  if(s.hasOwnProperty("name")) s.options.name = s.name;
  if(s.hasOwnProperty("prefix")) s.options.prefix = s.prefix;
  s.options.urls = s.urls;

  return s.options;
}

FluConfig.prototype.read_stream_options_j1 = function(s) {
  s.tracks_s = s.tracks ? s.tracks.join(" ") : "";
  if(s.rtp == "udp") s.rtp_udp = true;

  if(!(s.prepush == false)) s.prepush = true;
  if(!(s.static == false)) s.static = true;
}



//  $$$$$$\                      $$\           $$\ $$\                     
// $$  __$$\                     \__|          $$ |\__|                    
// $$ /  \__| $$$$$$\   $$$$$$\  $$\  $$$$$$\  $$ |$$\ $$$$$$$$\  $$$$$$\  
// \$$$$$$\  $$  __$$\ $$  __$$\ $$ | \____$$\ $$ |$$ |\____$$  |$$  __$$\ 
//  \____$$\ $$$$$$$$ |$$ |  \__|$$ | $$$$$$$ |$$ |$$ |  $$$$ _/ $$$$$$$$ |
// $$\   $$ |$$   ____|$$ |      $$ |$$  __$$ |$$ |$$ | $$  _/   $$   ____|
// \$$$$$$  |\$$$$$$$\ $$ |      $$ |\$$$$$$$ |$$ |$$ |$$$$$$$$\ \$$$$$$$\ 
//  \______/  \_______|\__|      \__| \_______|\__|\__|\________| \_______|
                                                                        
                                                                        
                                                                        

function ok_s(s) {
  if(typeof s == "number") return true;
  return s && s.length > 0;
}


FluConfig.prototype.serialize_config = function(config) {
  var s = "# Global settings:\n";
  var i;
  var g = config;
  for(i = 0; i < g.http.length; i++) {
    s += "http " + g.http[i]+";\n";
  }
  for(i = 0; i < g.https.length; i++) {
    s += "https " + g.https[i]+";\n";
  }
  for(i = 0; i < g.admin_http.length; i++) {
    s += "admin_http " + g.admin_http[i]+";\n";
  }
  for(i = 0; i < g.admin_https.length; i++) {
    s += "admin_https " + g.admin_https[i]+";\n";
  }
  if(parseInt(g.rtsp,10) > 0) s += "rtsp "+g.rtsp+";\n";
  if(parseInt(g.rtsps,10) > 0) s += "rtsps "+g.rtsps+";\n";
  if(parseInt(g.rtmp,10) > 0) s += "rtmp "+g.rtmp+";\n";
  if(parseInt(g.rtmps,10) > 0) s += "rtmps "+g.rtmps+";\n";
  if(parseInt(g.mysql,10) > 0) s += "mysql "+g.mysql+";\n";
  if(parseInt(g.snmp,10) > 0) s += "snmp "+g.snmp+";\n";
  if(parseInt(g.sip,10) > 0) s += "sip "+g.sip+";\n";

  if(ok_s(g.meta)) {
    s += "meta "+this.my_escape(g.meta)+";\n";
  }

  if(ok_s(g.loglevel) && g.loglevel != "info") s += "loglevel "+g.loglevel+";\n";
  if(parseInt(g.total_bandwidth,10) > 0) {
    s += "total_bandwidth "+this.shorten_disk_size(g.total_bandwidth)+";\n";
  }
  if(ok_s(g.wwwroot) > 0) s += "wwwroot "+g.wwwroot+";\n";
  if(g.log_requests === true) s += "logrequests true;\n";
  if(ok_s(g.auth_token) && g.auth_token != "token") s += "auth_token "+g.auth_token+";\n";

  s += this.write_auth_options(g.auth);
  if(parseInt(g.max_sessions) > 0) s += "max_sessions "+g.max_sessions+";\n";



  for(i = 0; i < g.notifies.length; i++) {
    if(typeof g.notifies[i] === "string" && ok_s(g.notifies[i])) {
      s += "notify "+g.notifies[i]+";\n";      
    } else {
      s += this.write_notify(g.notifies[i]);
    }
  }

  if(ok_s(g.aliaser)) {
    s += "aliaser "+g.aliaser+";\n";
  }

  if(ok_s(g.pulsedb)) {
    s += "pulsedb "+g.pulsedb+";\n";
  }

  if(ok_s(g.retroview)) {
    s += "retroview "+g.retroview+";\n";
  }

  if(ok_s(g.session_log)) {
    s += "session_log "+g.session_log+";\n";
  }

  if(ok_s(g.cluster_key)) {
    s += "cluster_key "+g.cluster_key+";\n";
  }

  if(ok_s(g.url_prefix) || g.url_prefix === false) {
    s += "url_prefix "+g.url_prefix+";\n";
  }

  if(ok_s(g.view_auth.login) && ok_s(g.view_auth.password)) {
    s += "view_auth "+g.view_auth.login + " "+g.view_auth.password+";\n";
  }

  if(ok_s(g.edit_auth.login) && ok_s(g.edit_auth.password)) {
    s += "edit_auth "+g.edit_auth.login + " "+g.edit_auth.password+";\n";
  }

  if(ok_s(g.init_script)) s += "init_script "+g.init_script+";\n";
  
  for(var i in g.web_scripts) {
    if(ok_s(g.web_scripts[i].prefix) && ok_s(g.web_scripts[i].path)) {
      var extra_s = [];
      if(g.web_scripts[i].extra) for(var k in g.web_scripts[i].extra) {
        var v = g.web_scripts[i].extra[k];
        if(ok_s(k) && ok_s(v)) extra_s.push(" "+k+"="+this.my_escape(v));
      }
      s += "web_script "+g.web_scripts[i].prefix+" "+g.web_scripts[i].path+ extra_s.join("")+";\n";
    }
  }

  for(var i in g.http_proxies) {
    if(ok_s(g.http_proxies[i].prefix) && ok_s(g.http_proxies[i].url)) {
      var extra_s = [];
      if(g.http_proxies[i].extra) for(var k in g.http_proxies[i].extra) {
        var v = g.http_proxies[i].extra[k];
        if(ok_s(k) && ok_s(v)) extra_s.push(" "+k+"="+this.my_escape(v));
      }
      s += "http_proxy "+g.http_proxies[i].prefix+" "+g.http_proxies[i].url+extra_s.join("")+";\n";
    }
  }

  // ip whitelist
  var valid_ips = !config.api_allowed_from
    ? []
    : config.api_allowed_from
        .filter(function(u) {return u && u.length > 0;})
        .map(function(u) {return u.replace("/32",""); });

  if (valid_ips.length > 0){
    s += "api_allowed_from " + valid_ips.join(" ") + ";\n";
  }
  if(g.cdnproxy === true) s += "cdnproxy;\n";


  for(i = 0; i < g.auth_backends.length; i++) {
    s += this.write_auth_backend(g.auth_backends[i]);
  }

  s += "\n# DVRs:\n";

  for(var i in config.dvrs) {
    var dvr = config.dvrs[i];
    if(!ok_s(dvr.name) || !ok_s(dvr.root)) continue;

    s += "dvr "+dvr.name+this.write_dvr_section(dvr);
  }


  s += "\n# Remote sources:\n";

  for(var i in config.peers) {
    if(i.indexOf("_changed") != -1) continue;
    var srv = config.peers[i];
    if(!ok_s(srv.name)) continue;

    s += "peer " + srv.name;
    if(srv.port) {
      s += ":" + srv.port;
    }
    var peer_keys = Object.keys(srv).sort().filter(function (k) {
      return(k != "port" && k != "name" && k != "position" && k.indexOf("_changed") == -1);
    });

    if(peer_keys.length > 0) {
      s += " {\n" + peer_keys.map(function(k) {
        return "  " + k + " " + this.my_escape(srv[k]) + ";\n"
      }.bind(this)).join("") + "}\n";
    } else {
      s += ";\n"
    }
  }


  for(var i in config.sources) {
    var src = config.sources[i];

    var urls = src.urls.filter(function(u) {return u && u.length > 0;});

    s += "source " + urls.join(" ");
    var src_options = Object.keys(src).filter(function(s) { return s != "urls"; });
    if(src_options.length > 0) {
      s += " {\n";
      if(src.only) s += "  only"+src.only.map(function(only) { return " "+only;}).join("")+";\n";
      if(src.except) s += "  except"+src.except.map(function(exc) { return " "+exc;}).join("")+";\n";

      s += this.write_stream_options(src, g);
      s += "}\n";
    } else {
      s += ";\n"
    }
  }

  s += "\n# Ingest streams:\n";

  var known_stream_names = {};
  for(var i in config.streams) {
    var stream = config.streams[i];
    if(!ok_s(stream.name)) continue;
    if(known_stream_names[stream.name]) continue;
    s += this.write_stream(stream, g);
    known_stream_names[stream.name] = true;
  }

  s += "\n# Dynamic rewrites:\n";

  for(var i in config.dynamics) {
    var dyn = config.dynamics[i];
    if(!ok_s(dyn.name)) continue;
    var pref = dyn.name.indexOf("/*") == -1 ? dyn.name + "/*" : dyn.name;
    s += "rewrite "+ pref +" {\n" + this.write_urls("url", dyn.urls);
    s += this.write_stream_options(dyn, g);
    s += "}\n";
  }


  s += "\n# Publish locations:\n";

  for(var i in config.lives) {
    var live = config.lives[i];
    if(!ok_s(live.prefix)) continue;
    s += "live "+live.prefix +" {\n";
    s += this.write_stream_options(live, g);
    s += "}\n";
  }

  s += "\n# Disk file caches:\n";

  for(var i in config.caches) {
    var cache = config.caches[i];
    if(!ok_s(cache.name) || !ok_s(cache.path)) continue;
    var misses = parseInt(cache.misses,10);
    if(misses > 0) misses = "misses="+misses;
    else misses = "";
    s += "cache "+cache.name + " "+cache.path;
    if(cache.time_limit) s += " " + cache.time_limit;
    if(cache.disk_limit) s += " " + cache.disk_limit;
    if(misses) s += " " + misses;
    s += ";\n";
  }

  s += "\n# VOD locations:\n";

  for(var i in config.vods) {
    var vod = config.vods[i];
    if(!ok_s(vod.prefix)) continue;

    s += "file "+vod.prefix + " {\n" + this.write_urls("path", vod.paths);
    if(vod.disabled) s+= "  disabled;\n";
    s += this.write_file_options(vod, g);
    s += "}\n";
  }

  s += "\n# Plugins:\n";
  for(var i in config.plugins) {
    if(config.plugins[i].name == "vsaas") {
      s += "vsaas";
    } else {
      s += "plugin " + config.plugins[i].name;
    }
    var options_s = [];
    for(var j in config.plugins[i]) {
      if(j == "name" || j == "position" || j.indexOf("_changed") != -1) continue;
      if(j == "forward_ports") {
        var forwards = config.plugins[i][j];
        var forwarded_ports = Object.keys(forwards);
        forwarded_ports.sort();
        // console.log(config.plugins[i][j]);
        // options_s.push("  "+j+" "+JSON.stringify(forwards));
        // options_s.push("  "+j+" "+JSON.stringify(forwarded_ports));
        for(var port_i = 0; port_i < forwarded_ports.length; port_i++) {
          options_s.push("  forward_port "+forwarded_ports[port_i]+" "+forwards[forwarded_ports[port_i]].handler+";\n");
        }
      } else {
        options_s.push("  " + j + " " + this.my_escape(config.plugins[i][j]) + ";\n");
      }
    }
    if(options_s.length == 0) {
      s += ";\n";    
    } else {
      s += " {\n";
      s += options_s.join("");
      s += "}\n";
    }
  }

  s += "\n";

  for(i = 0; i < config.includes.length; i++) {
    s += "include " + config.includes[i] + ";\n";
  }

  return s;
}


FluConfig.prototype.write_stream = function(stream, g) {
  var o = stream;
  var s = "";
  if(o.static) s += "stream ";
  else s += "ondemand ";
  s += stream.name +" {\n";

  if(o.disabled) s += "  disabled;\n";
  s += this.write_urls("url", stream.urls);
  s += this.write_stream_options(o, g);

  s += "}\n";
  return s;
}

FluConfig.prototype.my_escape = function(s) {
  if(!s.indexOf) return s;
  if((s == "" || s.indexOf(" ") != -1 || s.indexOf(";") != -1 || s.indexOf("#") != -1 ||
    s.indexOf("\"") != -1 || s.indexOf("\\") != -1 || s.indexOf("\n") != -1)) {
    var s1 = s.replace(/\\/g, "\\\\");
    var s2 = s1.replace(/\"/g, "\\\"");
    return "\""+s2+"\"";
  } else {
    return s;
  }
}

FluConfig.prototype.write_urls = function(prefix, urls) {
  return urls.map(function(u) {
    if(!ok_s(u.url)) {
      return "";
    } 
    return ("  " + prefix +" "+ this.my_escape(u.url) +
    Object.keys(u).map(function(k) {
      if(k == "url" || !u.hasOwnProperty(k)) return "";
      var v = u[k];
      if(ok_s(k) && ok_s(v)) {
        return " "+k+"="+this.my_escape(v);
      } else {
        return "";
      }
    }.bind(this)).join("") + ";\n");
  }.bind(this)).join("");
}


FluConfig.prototype.write_file_options = function(o, g) {
  var s = "";

  s += this.write_auth_options(o.auth, g);
  s += this.write_cache_options(o);

  if(ok_s(o.title)) s += "  title "+this.my_escape(o.title)+";\n";
  if(ok_s(o.provider)) s += "  provider "+this.my_escape(o.provider)+";\n";
  if(parseInt(o.read_queue,10) > 0) s += "  read_queue "+o.read_queue+";\n";
  if(parseInt(o.max_readers,10) > 0) s += "  max_readers "+o.max_readers+";\n";
  if(o.add_audio_only == true) s += "  add_audio_only;\n";
  if(o.download == true) s += "  download;\n";
  if(parseInt(o.segment_duration,10) > 0) s += "  segment_duration "+o.segment_duration+";\n";
  s += this.write_ad_inject_options(o);
  s += this.write_meta(o);

  s +=
    this.write_bool_option(o,"hls") +
    this.write_bool_option(o,"hds") +
    this.write_bool_option(o,"rtmp") +
    this.write_bool_option(o,"rtsp") +
    this.write_bool_option(o,"dash") +
    this.write_bool_option(o,"mpegts") +
    this.write_bool_option(o,"webrtc");

  s += this.write_drm_options(o);

  if(ok_s(o.url_prefix) || o.url_prefix === false) {
    s += "  url_prefix " + o.url_prefix + ";\n";
  }

  return s;
}


FluConfig.prototype.write_notify = function(o) {
  var only = o.only || [];
  var except = o.except || [];
  var s = "notify "+o.name+" {\n";

  if(ok_s(o.sink)) {
    s += "  sink " + o.sink +";\n";
  }
  
  var conditions = function(cond) {
    var keys = Object.keys(cond).sort();
    return keys.map(function(k) {
      var v = cond[k];
      if(Array.isArray(v)) {
        return " "+k+"="+v.join(",");
      } else {
        return " "+k+"="+v;
      }
    }).join("");
  }

  only.forEach(function(cond) {
    s += "  only"+conditions(cond)+";\n";
  });
  except.forEach(function(cond) {
    s += "  except"+conditions(cond)+";\n";
  });
  if(ok_s(o.owner)) {
    s += "  owner "+o.owner+";\n";
  }
  if(ok_s(o.verbose)) {
    s += "  verbose "+o.verbose+";\n";
  }
  if(o.buffer === false) { 
    s += "  buffer off;\n";
  } else if(o.buffer > 0) {
    s += "  buffer "+o.buffer+";\n";
  }
  if(ok_s(o.throttle_delay)) {
    s += "  throttle_delay "+o.throttle_delay+";\n";
  }
  var alist = Object.keys(o.args || {});
  alist.forEach(function(a) {
    s += "  "+a+" "+o.args[a]+";\n";
  });
  s += "}\n";
  return s;
}


FluConfig.prototype.write_auth_backend = function(o) {
  var s = "auth_backend "+o.name+" {\n";
  var my_escape = this.my_escape;
  (o.allow_tokens || []).forEach(function(tok) {
    s += "  allow token "+my_escape(tok)+";\n";
  });
  (o.deny_tokens || []).forEach(function(tok) {
    s += "  deny token "+my_escape(tok)+";\n";
  });
  (o.allow_ips || []).forEach(function(tok) {
    s += "  allow ip "+my_escape(tok)+";\n";
  });
  (o.deny_ips || []).forEach(function(tok) {
    s += "  deny ip "+my_escape(tok)+";\n";
  });
  (o.allow_countries || []).forEach(function(tok) {
    s += "  allow country "+my_escape(tok)+";\n";
  });
  (o.deny_countries || []).forEach(function(tok) {
    s += "  deny country "+my_escape(tok)+";\n";
  });
  (o.allow_uas || []).forEach(function(tok) {
    s += "  allow ua "+my_escape(tok)+";\n";
  });
  (o.deny_uas || []).forEach(function(tok) {
    s += "  deny ua "+my_escape(tok)+";\n";
  });
  (o.backends || []).forEach(function(back) {
    var extra = "";
    if(back.extra) for(var k in back.extra) {
      if(ok_s(k) && ok_s(back.extra[k])) extra = extra + " "+k+"="+my_escape(back.extra[k]);
    }
    s += "  backend "+back.url + extra+";\n";
  });
  if(o.allow_default) {
    s += "  allow default;\n";
  }
  s += "}\n";
  return s;
}

FluConfig.prototype.write_ad_inject_options = function(o) {
  var s = "";
  if(!o.ad_inject) return s;

  s += "  ad_inject";

  var keys = [];
  for(var k in o.ad_inject) {
    keys.push(k);
  }
  for(var i = 0; i < keys.length; i++) {
    if(ok_s(o.ad_inject[keys[i]])) s += " "+keys[i]+"="+o.ad_inject[keys[i]];
  }
  s += ";\n";
  return s;
}


FluConfig.prototype.write_drm_options = function(o) {
  var s = "";
  if(!o.drm) return s;
  if(ok_s(o.drm.vendor)) {
    s += "  drm " + o.drm.vendor;
    if(ok_s(o.drm.keyserver)) s += " keyserver="+o.drm.keyserver;
    if(ok_s(o.drm.resource_id)) s += " resource_id="+o.drm.resource_id;
    if(ok_s(o.drm.user_keyserver)) s += " user_keyserver="+o.drm.user_keyserver;
    s +=  ";\n";
  }
  return s;
}

FluConfig.prototype.write_auth_options = function(o, g) {
  var s = "";
  if(!o) return;

  var w = "  ";
  if(g && g.auth) {
    g = g.auth;
  } else if(!g) {
    w = "";
    g = {};
  }

  // TODO: переделать здесь auth.extra на {} #2782
  var extra = "";
  if(o.extra) for(var k in o.extra) {
    if(ok_s(k) && ok_s(o.extra[k])) extra = extra + " "+k+"="+this.my_escape(o.extra[k]);
  }

  if(o.url === false || o.url === "false") {
    s += w + "auth false"+extra+";\n";
  } else if ((o.url === true || o.url === "true") && (ok_s(g.url) && g.url !== true && g.url != "true")) {
    s += w + "auth true"+extra+";\n";
  } else if(o.url && o.url != true && o.url != "true") {
    s += w + "auth "+o.url+extra+";\n";
  }
  if(o.autogenerate_token === false || (o.autogenerate_token && o.autogenerate_token != "blank")) {
    s += w + "auto_token "+o.autogenerate_token+";\n";
  }

  if(o.allowed_countries_s){
      var allowed_countries = o.allowed_countries_s.split(/[\s,]/).map(function(d) {return d.replace(/[\s,]/g,'');}).filter(function(d){return d.length > 0});
      s += w + "allowed_countries "+allowed_countries.join(" ")+";\n";
  }
  if(o.disallowed_countries_s){
      var disallowed_countries = o.disallowed_countries_s.split(/[\s,]/).map(function(d) {return d.replace(/[\s,]/g,'');}).filter(function(d){return d.length > 0});
      s += w + "disallowed_countries "+disallowed_countries.join(" ")+";\n";
  }
  if(o.domains_s) {
    var domains = o.domains_s.split(/[\s,]/).map(function(d) {return d.replace(/[\s,]/g,'');}).filter(function(d){return d.length > 0});
  } else {
    var domains = [];
  }
  if(domains.length == 1) {
    s += w + "domain "+domains[0]+";\n";
  } else if(domains.length > 0) {
    s += w + "domains "+domains.join(" ")+";\n";        
  }
  if(o.max_sessions) {
    s += w + "max_sessions "+o.max_sessions+";\n";
  }
  return s;
}

FluConfig.prototype.write_cache_options = function(o) {
  var s = "";
  if(o.cache && ok_s(o.cache.reference)) {
    s += "  cache @"+o.cache.reference+";\n";
  } else if(o.cache) {
    var path = o.cache.path || "";
    var tlimit = o.cache.time_limit || "";
    var dlimit = o.cache.disk_limit || "";
    var misses = parseInt(o.cache.misses,10) > 0 ? "misses="+o.cache.misses : "";
    if (path || tlimit || dlimit || misses) {
      s += "  cache "+path;
      if(tlimit) s += " " + this.serialize_time(tlimit);
      if(dlimit) s += " " + this.shorten_disk_size(dlimit);
      if(misses) s += " " + misses;
      s += ";\n";
    }
  }
  if(o.segment_cache) {
    var path = o.segment_cache.path || "";
    var tlimit = o.segment_cache.time_limit || "";
    var dlimit = o.segment_cache.disk_limit || "";
    var misses = parseInt(o.segment_cache.misses,10) > 0 ? "misses="+o.segment_cache.misses : "";
    if (path || tlimit || dlimit || misses) {
      s += "  segment_cache "+path;
      if(tlimit) s += " " + this.serialize_time(tlimit);
      if(dlimit) s += " " + this.shorten_disk_size(dlimit);
      if(misses) s += " " + misses;
      s += ";\n";
    }
  }
  return s;
}
FluConfig.prototype.write_dvr_optline = function(o) {
  var dvr = o.dvr_offline == true ? "dvr_offline" : "dvr";
  return "  "+dvr+this.write_dvr_optline2(o);
}

FluConfig.prototype.write_dvr_optline2 = function(o) {
  if(!ok_s(o.root) && !ok_s(o.reference)) return "";

  var disk_limit = "";
  if(! (parseInt(o.disk_limit,10) > 0)) disk_limit = "";
  // if( parseInt(o.disk_limit,10) > 0 && o.disk_limit.indexOf("%") == -1) disk_limit += "%";
  if( parseInt(o.disk_limit,10) > 0 ) disk_limit = " " + parseInt(o.disk_limit) + "%";


  var dvr_limit = "";
  if(parseInt(o.dvr_limit,10) > 0) { dvr_limit = " " + this.serialize_time(o.dvr_limit); }

  var dvr_replicate = "";
  if (o.dvr_replicate) { dvr_replicate = " replicate" + (o.replication_speed > 0 ? "="+this.shorten_disk_size(o.replication_speed) : ""); }

  var replication_port = "";
  if (o.replication_port) { replication_port = " replication_port=" + o.replication_port; }

  var no_index = "";
  if (o.no_index) { no_index = " no_index"; }

  var disk_space = "";
  if(o.disk_space) {disk_space = " " + this.shorten_disk_size(o.disk_space); }

  var schedule = "";
  if(o.schedule) {schedule = " schedule=" + this.render_dvr_schedule(o.schedule); }

  var copy = "";
  if(o.copy) {copy = " copy=" + o.copy; }

  var dvr_root = o.root ? o.root : "@"+o.reference;
  return " "+dvr_root+dvr_limit+disk_limit+disk_space+dvr_replicate+replication_port+no_index+schedule+copy+";\n";
}

FluConfig.prototype.write_dvr_section = function(o) {
  if(!ok_s(o.root) && !ok_s(o.reference)) return "";

  var dvr_root = "  root "+o.root+";\n";

  var disk_limit = "";
  if(! (parseInt(o.disk_limit,10) > 0)) disk_limit = "";
  // if( parseInt(o.disk_limit,10) > 0 && o.disk_limit.indexOf("%") == -1) disk_limit += "%";
  if( parseInt(o.disk_limit,10) > 0 ) disk_limit = " " + parseInt(o.disk_limit) + "%";

  var dvr_limit = "";
  if(parseInt(o.dvr_limit,10) > 0) { dvr_limit = " " + this.serialize_time(o.dvr_limit); }

  var disk_space = "";
  if(o.disk_space) {disk_space = " " + this.shorten_disk_size(o.disk_space); }

  var limits = disk_limit + dvr_limit + disk_space;
  if ((disk_limit + dvr_limit + disk_space) != "") {limits = "  limits" + limits + ";\n"; }

  var dvr_replicate = "";
  if (o.dvr_replicate) {dvr_replicate = "  replicate" + (o.replication_port ? " port=" + o.replication_port : "") + ";\n"; }

  var no_index = "";
  if (o.no_index) { no_index = "  no_index;\n"; }

  var schedule = "";
  if(o.schedule) {schedule = "  schedule " + this.render_dvr_schedule(o.schedule) + ";\n"; }

  var copy = "";
  if(o.copy) {copy = "  copy " + o.copy + ";\n"; }

  var index = "";
  if(o.index) {index = "  metadata " + o.index + ";\n"; }

  var active = o.active ? "  active "+o.active+";\n" : "";
  var raid = ("raid" in o) ? "  raid "+o.raid+";\n" : "";

  var disk_lines = "";
  if (o.disks) {
    var disks = [];
    // construct a config line for every disk, tag it with a position and append to a disks list -- "proplist"
    for (var d in o.disks) {
      var line = "  disk " + d + (o.disks[d].mode ? " " + o.disks[d].mode : "") + ";\n";
      disks.push([o.disks[d].position, line]);
    }
    // sort "proplist" by first element (e.g. by position)
    disks.sort(function (a, b) {return a[0] - b[0];});
    // add config lines to accumulator keeping their order
    for (var i = 0; i < disks.length; i++) {
      disk_lines += disks[i][1];
    }
  }
  return " {\n"+dvr_root+raid+active+limits+dvr_replicate+no_index+schedule+copy+index+disk_lines+"}\n";
}


FluConfig.prototype.render_dvr_schedule = function(s){
  if (!s) return "";
  var render_time = function(t){
    var mm = t % 100;
    var hh = Math.round((t - mm) / 100);
    var time = "" + hh;
    if (mm != 0) time += ":" + ("0"+mm).slice(-2);
    return time;
  };
  var schedule = s.reduce(function(acc, range){
    return acc + "," + render_time(range[0]) + "-" + render_time(range[1]);
  }, "");
  if (schedule != "")
    schedule = schedule.slice(1);
  return schedule;
}

FluConfig.prototype.write_bool_option = function(o, key) {
  if(o[key+"_off"]) return "  "+key+" off;\n";
  if(o.hasOwnProperty(key) && o[key] === false) return "  "+key+" off;\n";
  return "";
}


FluConfig.prototype.write_meta = function(o) {
  var s = "";
  var meta = {};
  var meta_keys = [];
  if(o.meta) {
    if(o.meta.forEach) {
      o.meta.forEach(function(m) {
        meta[m[0]] = m[1];
        meta_keys.push(m[0]);
      });
    } else {
      for(var k in o.meta) {
        meta[k] = o.meta[k];
        meta_keys.push(k);
      }
    }
  }
  // console.log("meta", JSON.stringify(meta_keys), JSON.stringify(meta));

  if(o.hasOwnProperty('postal_address')) {
    meta_keys.push("postal_address");
    meta.postal_address = o.postal_address;
  }
  if(o.coordinates && !isNaN(parseFloat(o.coordinates.lat)) && !isNaN(parseFloat(o.coordinates.lng)) ) {
    meta_keys.push("coordinates");
    meta.coordinates = "" + o.coordinates.lat+" "+o.coordinates.lng;
  }
  if(o.hasOwnProperty('comment')) {
    meta_keys.push("comment");
    meta.comment = o.comment;
  }
  meta_keys.sort();


  for(var i = 0 ; i < meta_keys.length; i++) {
    var key = meta_keys[i];
    var val = meta[key];
    if(key == "extra") {
      val = this.my_escape(val);
    } else {
      val = "\""+val+"\"";
    }
    s += "  meta "+key+" "+val+";\n";
  }
  return s;
}

FluConfig.prototype.write_stream_options = function(o, g) {
  var s = "";

  if(ok_s(o.title)) s += "  title "+this.my_escape(o.title)+";\n";
  if(ok_s(o.provider)) s += "  provider "+this.my_escape(o.provider)+";\n";

  s += this.write_auth_options(o.auth, g);

  if(parseInt(o.max_sessions,10) > 0) s += "  max_sessions "+o.max_sessions+";\n";


  if(o.add_audio_only == true) s += "  add_audio_only;\n";

  if(parseInt(o.max_bitrate,10) > 0) s += "  max_bitrate "+o.max_bitrate+";\n";
  if(parseInt(o.segment_count,10) > 0) s += "  segment_count "+o.segment_count+";\n";
  if(parseInt(o.segment_duration,10) > 0) s += "  segment_duration "+o.segment_duration+";\n";
  if(ok_s(o.backup)) s += "  backup "+o.backup+";\n";

  if(o.prepush == false) s += "  prepush off;\n";
  if (parseInt(o.prepush_duration, 10) > 0) {
    if (o.prepush) s += "  prepush " + o.prepush_duration + ";\n";
  } else {
    if(parseInt(o.prepush, 10) > 0) s += "  prepush " + o.prepush + ";\n";
  }

  if(o.pulse_off) s += "  pulse off;\n";

  s += this.write_ad_inject_options(o);
  if(o.ad_schedule && ok_s(o.ad_schedule.schedule) && ok_s(o.ad_schedule.alias)){
    s += "  ad_schedule " + o.ad_schedule.schedule + " " + o.ad_schedule.alias + ";\n";
  }

  s += this.write_cache_options(o);

  s += this.write_meta(o);
  
  if(o.thumbnails && o.thumbnails.url) {
    s += "  thumbnails url="+ o.thumbnails.url +";\n";
  } else if (o.thumbnails) {
    s += "  thumbnails;\n";
  }

  if(o.dvr) {
    s += this.write_dvr_optline(o.dvr);
  }
  
  s += 
    this.write_bool_option(o,"hls") +
    this.write_bool_option(o,"hds") +
    this.write_bool_option(o,"rtmp") +
    this.write_bool_option(o,"rtsp") +
    this.write_bool_option(o,"dash") +
    this.write_bool_option(o,"m4s") +
    this.write_bool_option(o,"m4f") +
    this.write_bool_option(o,"mseld") +
    this.write_bool_option(o,"mpegts") +
    this.write_bool_option(o,"webrtc");
  
  if(ok_s(o.password)) {
    s += "  password "+o.password+";\n";
  }

  if(ok_s(o.on_publish)) {
    s += "  on_publish "+o.on_publish+";\n";
  }

  s += this.write_drm_options(o);

  var j;
  if(o.pushes) {
    for(j = 0; j < o.pushes.length; j++) {
      if(ok_s(o.pushes[j])) {
        if(o.pushes[j].indexOf("udp://") == 0) {
          s += "  udp "+o.pushes[j].substring(6)+";\n";
        } else {
          s += "  push "+o.pushes[j]+";\n";
        }
      }
    }
  }

  if(o.groups) {
    if(o.groups.length == 0) {
      s += "  group;\n";
    } else {
      for(j = 0; j < o.groups.length; j++) {
        if(ok_s(o.groups[j])) {
          s += "  group "+o.groups[j]+";\n";
        }
      }
    }
  }

  var sg;
  if(o.group_config) {
    for(var grp in o.group_config) {
      sg = this.write_stream_options(o.group_config[grp], g);
      sg = prepend_left("  ", sg)
      s += "  group_config "+grp+" {\n"+sg+"}\n";
    }
  }

  if(parseInt(o.retry_limit,10) > 0) s += "  retry_limit "+o.retry_limit+";\n";
  if(o.clients_timeout == false || parseInt(o.clients_timeout,10) > 0) s += "  clients_timeout "+o.clients_timeout+";\n";
  if(o.source_timeout == false || parseInt(o.source_timeout,10) > 0) s += "  source_timeout "+o.source_timeout+";\n";
  if(parseInt(o.frames_timeout,10) > 0) s += "  frames_timeout "+o.frames_timeout+";\n";

  if(o.publish_enabled) s += "  publish_enabled;\n";

  if(o.tracks_s) {
    var tracks = o.tracks_s.split(/[\s,]/).map(function(d) {return d.replace(/[\s,]/g,'');}).filter(function(d){return d.length > 0});
    if(tracks.length > 0) s += "  tracks "+tracks.join(" ")+";\n";    
  }

  if(o.rtp_udp) s += "  rtp udp;\n";

  if(ok_s(o.transcoder_s)) {
    s += "  transcoder " + o.transcoder_s;
    s += ";\n";
  } 

  if(o.motion_detector) {
    var md_s = '';
    md_s += "  motion_detector";
    if (o.motion_detector.length > 0) {
      for(var j = 0; j < o.motion_detector.length; j++) {
        if(o.motion_detector[j].key == "enabled") {
          if (o.motion_detector[j].value === false) {
            md_s = '';
            break;
          }
        } else if(o.motion_detector[j].key == "tags") {
          for(var z in o.motion_detector[j].value) {
            md_s += " tag="+this.my_escape(o.motion_detector[j].value[z]);
          }
        } else if(o.motion_detector[j].key == "notify") {
          for(var z in o.motion_detector[j].value) {
            md_s += " notify="+this.my_escape(o.motion_detector[j].value[z]);
          }
        } else {
          md_s += " " + o.motion_detector[j].key + "=" + this.my_escape(o.motion_detector[j].value);
        }
      }
      md_s += ";\n";
    } else {
      md_s += ";\n";    
    }
    s += md_s;
  }

  if(ok_s(o.cluster_key)) {
    s += "  cluster_key " + o.cluster_key + ";\n";
  }
  if(ok_s(o.url_prefix) || o.url_prefix === false) {
    s += "  url_prefix " + o.url_prefix + ";\n";
  }

  if(o.cluster_ingest) {
    s += "  cluster_ingest";
    if (o.cluster_ingest.length > 0) {
      for(var j = 0; j < o.cluster_ingest.length; j++) {
        s += " " + o.cluster_ingest[j].key + "=" + o.cluster_ingest[j].value;
      }
      s += ";\n";
    } else {
      s += ";\n";    
    } 
  }


  return s; 
}

// from string to object
FluConfig.prototype.deserialize_transcoder = function(transcoder_s) {
  if (transcoder_s == '') {
    return [];
  }

  var result = [];
  var parts = transcoder_s.trim().split(/\ +/).map(function (part) { return part.split('='); });

  var parseKey = function (key) {
    switch (key) {
    case 'ab': return 'audio_bitrate';
    case 'vb': return 'video_bitrate';
    default: return key;
    }
  };

  var parseValue = function (value) {
    if (/^\d+k$/.test(value)) {
      return parseInt(value.replace('k', '000'));
    } else {
      return value;
    }
  };

  for (var i in parts) {
    var key = parts[i][0];
    var value = parts[i][1];

    result.push({key: parseKey(key), value: parseValue(value) || ""})
  }

  return result;
}

FluConfig.prototype.serialize_transcoder = function(transcoder) {
  var s = "";
  var j;

  var bitrate = function(v) {
    if(v == "copy") {
      return v;
    } else if(v > 0) {
      return (Math.round(v / 1000)) + "k";
    } else if(ok_s(v)) {
      return v;
    }
  }

  for(j = 0; j < transcoder.length; j++) {
    var k = transcoder[j].key;
    var v = transcoder[j].value;
    if(k == "audio_bitrate") {
      s += (" ab="+bitrate(v));
    } else if(k == "video_bitrate") {
      s += (" vb="+bitrate(v));
    } else if(k.length > 0 && v.length > 0) {
      s += (" "+k+"="+v);
    }
  }
  if(s[0] == " ") {
    s = s.slice(1,s.length);
  }
  return s;
}


function prepend_left(s, text) {
  var lines = text.split(/\n/);
  var lines1 = lines.map(function(line) {
    return s + line;
  })
  return lines1.join("\n")
}
