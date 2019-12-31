

//  $$$$$$\        $$\       $$$$$$\                                     $$\                         
// $$  __$$\       $$ |      \_$$  _|                                    $$ |                        
// $$ /  $$ | $$$$$$$ |        $$ |  $$$$$$$\  $$\  $$$$$$\   $$$$$$$\ $$$$$$\    $$$$$$\   $$$$$$\  
// $$$$$$$$ |$$  __$$ |        $$ |  $$  __$$\ \__|$$  __$$\ $$  _____|\_$$  _|  $$  __$$\ $$  __$$\ 
// $$  __$$ |$$ /  $$ |        $$ |  $$ |  $$ |$$\ $$$$$$$$ |$$ /        $$ |    $$ /  $$ |$$ |  \__|
// $$ |  $$ |$$ |  $$ |        $$ |  $$ |  $$ |$$ |$$   ____|$$ |        $$ |$$\ $$ |  $$ |$$ |      
// $$ |  $$ |\$$$$$$$ |      $$$$$$\ $$ |  $$ |$$ |\$$$$$$$\ \$$$$$$$\   \$$$$  |\$$$$$$  |$$ |      
// \__|  \__| \_______|      \______|\__|  \__|$$ | \_______| \_______|   \____/  \______/ \__|      
//                                       $$\   $$ |                                                  
//                                       \$$$$$$  |                                                  
//                                        \______/                                                   



function AdInjectorController($scope, $http) {
  $scope.is_schedule = function() {
    return $scope.selected_schedule !== false;
  }
  
  $scope.file_selected = function(file) {
    if ($scope.selected_schedule === false)
      return false;
    var fullname = file.prefix + file.subpath;
    return $scope.files.reduce(function(acc, f){
      return acc || f.name === fullname}, false);
  };
  
  $scope.remove_schedule_file = function(file){ 
    $scope.files = $scope.files.filter(function(f){ return f.name != file.name; });
  };
  
  $scope.add_remove_file = function(file){ 
    if ($scope.selected_schedule === false)
      return;
    var fullname = file.prefix + file.subpath;
    if ($scope.file_selected(file))
      $scope.files = $scope.files.filter(function(f){ return f.name != fullname; });
    else
      $scope.files.push({name: fullname, weight: 0});
  };
  
  $scope.load_vod = function(index, path) {
    var vod = index.prefix ? index : $scope.vods[index];
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
            return _sub_path + (_sub_path === '/' ? "" : "/");
          },'/');
      }        
      
      for(var i = 0; i < reply.files.length; i++) {
        var f = reply.files[i];
        f.prefix = vod.prefix;
        f.path = vod.path;
        f.subpath = path + (path == "/" ? "" : "/") + f.name;
        if (f.type == "directory") {
          vod.dirs.push(f);
        }
        else if(f.type == "file" && ((f.name.indexOf(".mp4") == f.name.length-4)
                             || (f.name.indexOf(".f4v") == f.name.length-4))) {
          vod.files.push(f);
        }
      }
    });
  }
    
  
  $scope.schedules = [];
  $scope.selected_schedule = false;
  $scope.files = [];
  $scope.load_schedules = function() {
//     $http({url : "/flussonic/api/list_files", method : "GET", params : {subpath : '/'}})
//       .success(function(reply) {
//         $scope.files = reply.files
//           .filter(function(f){ return f.type === "file" })
//           .filter(function(f){ return (f.name.indexOf(".mp4") == f.name.length-4)
//                                    || (f.name.indexOf(".f4v") == f.name.length-4); })
//           .map(function(f){ return {name: f.prefix + "/" + f.name}; })
//           .sort(function(f1,f2){return f1.name.localeCompare(f2.name)});
//       });
    
    
    $http.get("/flussonic/api/fetch_ad_schedules").
    success(function(data) {
      var i;
      for(i = 0; i < data.schedules.length; i++) {
        var files = data.schedules[i].files;
        var j;
        data.schedules[i].files = {};
        for(j = 0; j < files.length; j++) {
          data.schedules[i].files[files[j].name] = files[j].weight;
        }
      }
      $scope.schedules = data.schedules;
    })
  };
  $scope.load_ad_streams = function() {
    $http.get("/flussonic/api/ad_streams").
    success(function(data) {
      $scope.ad_streams = [];
      for(var s in data)
        $scope.ad_streams.push({name: s, files: data[s]});
    })
  };
  
  $http.get("/flussonic/api/get_config").success(function(reply) {
    var vods = [];
    for(var i = 0; i < reply.config.length; i++) {
      if(reply.config[i].entry == "file") {
        for(var j = 0; j < reply.config[i].value.paths.length; j++) {
          var path = reply.config[i].value.paths[j];
          if(path.value.indexOf("http://") != 0 && path.value.indexOf("s3://") != 0) {          
            vods.push({prefix : reply.config[i].value.prefix, path : path.value});
          }
        }
      }
    }
    $scope.vods = vods;
  });
  
  setTimeout($scope.load_schedules, 0);
  setTimeout($scope.load_ad_streams, 0);

  $scope.save_schedules = function() {
    var schedules = [];
    for(var i = 0; i < $scope.schedules.length; i++) {
      var s = {
        name : $scope.schedules[i].name,
        slots : [],
        files : []
      }
      var j;
      for(j = 0 ; j < $scope.schedules[i].slots.length; j++) {
        s.slots.push({
          from : $scope.schedules[i].slots[j].from,
          duration : Number($scope.schedules[i].slots[j].duration || 0)
        })
      }
      var f;
      for(f in $scope.schedules[i].files) {
        var weight = $scope.schedules[i].files[f];
        if(weight == "") weight = 1;
        s.files.push({name : f, weight : Number(weight)})
      }
      schedules.push(s);
    }

    $http.post("/flussonic/api/save_ad_schedules", JSON.stringify({schedules : schedules})).
      success(function() {
        setTimeout(function() {
          $(".save-config-btn").button("reset");        
        }, 500);
      }).
      error(function(data) {
        $(".save-config-btn").button("reset");
        console.log(data);
      });
  };










  $scope.time = /\d\d:\d\d:\d\d/;
  $scope.new_schedule_name = "";

  $scope.add_schedule = function() {
    if(!$scope.new_schedule_name) return;
    $scope.schedules.push({name : $scope.new_schedule_name, slots : []});
  };

  $scope.remove_schedule = function(i) {
    $scope.schedules.splice(i,1);
  };
  
  function add_time(time, h, m, s){
    var parts = time.split(':').map(Number);
    var new_time = new Date(0,0,0,parts[0]+h, parts[1]+m, parts[2]+s,0);
    return new_time.toTimeString().substr(0,8);
  }

  $scope.add_slot = function(s) {
    var new_slot = {};
    if (s.slots && s.slots.length > 0){
      var last_slot = s.slots[s.slots.length-1];
      new_slot.duration = last_slot.duration;
      new_slot.from = add_time(last_slot.from, 0, 15, 0);
    };
    s.slots.push(new_slot);
  };

  $scope.remove_slot = function(s, i) {
    s.slots.splice(i, 1);
  };

  $scope.select_schedule = function(i) {
    $scope.selected_schedule = i;
    var j;
    for(j = 0; j < $scope.files.length; j++) {
      delete $scope.files[j]["using"];
      delete $scope.files[j]["weight"];
    }
    if(i === false) return;
    $scope.files = [];
    for(k in $scope.schedules[i].files) {
      var w = $scope.schedules[i].files[k];
      $scope.files.push({name: k, weight: w});
    }
  };

  $scope.refresh_files = function(i) {
    var j;
    $scope.schedules[i].files = {};
    for(j = 0; j < $scope.files.length; j++) {
      $scope.schedules[i].files[$scope.files[j].name] = $scope.files[j].weight;
    }
    // console.log($scope.schedules[i]);
  };
}

function AdSchedulesDirective() {
  function watch($scope, i) {
    return $scope.$watch("files", function(files) {
      // console.log("files changed ", i);
      $scope.refresh_files(i);
    }, true);    
  }

  return {
    controller : function($scope) {
      this.opening_now = false;
      this.opened_now = false;
      this.going_to_open = function(i) {
        // console.log("going to show", i, "instead of",this.opened_now);
        this.opened_now = false;
        this.opening_now = i;
        if(this.unwatcher) {
          // console.log("unwatch");
          this.unwatcher();
          this.unwatcher = false;
        }
        $scope.$apply("select_schedule(false)");
      }

      this.opened = function(i) {
        // console.log("showing ",i);
        $scope.$apply("select_schedule("+i+")");
        this.opening_now = false;
        this.opened_now = i;
        this.unwatcher = watch($scope, i);
      }

      this.hidden = function(i) {
        if(this.opening_now != false) return;
        if(this.opened_now != i) return;

        if(this.unwatcher) {
          // console.log("unwatch");
          this.unwatcher();
          this.unwatcher = false;
        }

        $scope.$apply("select_schedule(false)");        
      }
    },
    link : function($scope) {

    }
  }
}

function AdScheduleDirective() {
  var link = function($scope, $element, $attrs, $ctrl) {
    // console.log("directive ",$ctrl);
    $($element).on("show.bs.collapse", function() {
      $ctrl.going_to_open(parseInt($element.attr('data-index')));
      $element.parent().siblings(".panel").find(".panel-collapse.in").collapse("hide");
    }).on("shown.bs.collapse", function() {
      $ctrl.opened(parseInt($element.attr('data-index')));
    }).on("hidden.bs.collapse", function() {
      $ctrl.hidden(parseInt($element.attr('data-index')));
    });
  }

  return {
    require : "^adSchedules",
    link : link
  }
}

