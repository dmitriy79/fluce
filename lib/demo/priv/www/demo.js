function normalizeUrl(url) {
  var a = document.createElement('a');
  a.href = url;
  a.hostname = window.location.hostname;
  return a.href;
}

class Loader extends Hls.DefaultConfig.loader {

  constructor(config) {
    super(config);
    var load = this.load.bind(this);
    this.load = function(context, config, callbacks) {
      context.url = normalizeUrl(context.url);
      load(context,config,callbacks);
    };
  }
}

function loadApp(data) {
  return new Vue({
    el: '#app',
    data: data,
    methods: {
      launch: function(name) {
        fetch("/demo/api/instances/"+name, {method: "post", credentials: 'same-origin'}).then(function(response) {
          return response.json()
        });
      },

      stop: function(name) {
        fetch("/demo/api/instances/"+name, {method: "delete", credentials: 'same-origin'}).then(function(response) {
          return response.json()
        });
      },

      command: function(name, cmd, options) {
        options.name = name;
        options.command = cmd;
        fetch("/demo/api/command", {method: "post", credentials: 'same-origin', 
          body: JSON.stringify(options)}).then(function(response) {
          return response.json()
        });
      },

      play: function(server, stream) {
        this.playUrl('http://'+server.name+':'+server.config.http[0]+'/'+stream+'/index.m3u8');
      },

      playUrl: function(url) {
        var video = document.getElementById('player');
        this.play_url = url;
        self = this;

        var http = new XMLHttpRequest();
        http.open('HEAD', normalizeUrl(url));
        http.setRequestHeader("x-no-redirect", "yes");
        http.onreadystatechange = function() {
          if (this.readyState === this.DONE) {
            if(this.getResponseHeader("Location")) {
              self.play_url = this.getResponseHeader("Location");
            }
            var hls = new Hls({loader: Loader});
            hls.loadSource(self.play_url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED,function() {
              video.play();
            });
            
          }
        };
        http.send();

      }
    }
  });
}