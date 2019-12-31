var TimelineItem = function(args){
    args = args || {};
    this.type = 'range';
    this.group = args.group;
    this.id = args.id;
    this.start = args.start;
    this.end = args.end;
    this.className = args.group;
    this.title = args.title;
    switch(args.group){
        case 'crop': this.title = "Вырезка"; break
        case 'mute': this.title = "Отключение звука"; break
        case 'overlay': this.title = "Наложение"; break;
    }

    this.position_content = function(){
        if (this.group != 'overlay') return '';
        return ' <span>' + App.utils.positionStr(this.position) +'</span>';
    };
    this.time_content = function(){
        return ' <div class="vis-item-tr">' + App.utils.msToTime(this.start) + ' - ' + App.utils.msToTime(this.end) +'</div>';
    };
    this.update_content = function(){
        this.content = this.title + this.position_content() + this.time_content();
        // App.effects.updateItem(this);
        // App.effects.data.update(this);
    };
    this.set_range = function(start, end){
        this.start = start;
        this.end = end;
        this.update_content();
    };
    this.set_position = function(rect){
        if (this.group === "overlay"){
            this.position = {
                x1: rect.x1, y1: rect.y1,
                x2: rect.x2, y2: rect.y2,
            }
            this.update_content();
        }
    };
    if (args.position)
        this.set_position(args.position);
    this.update_content();
}

var App = {
    effects: {
        data:[],
        overlayItems:{},
        cropTimes:[],
        cropTimesCount: 0,
        timeline:{
            options: {
                delay: 0,
                paused: true,
                useFrames: false,
                smoothChildTiming: false
            },
            gsap:{},
            update: function(callback){
                var t = this.gsap.time();
                this.gsap.clear();

                App.effects.cropTimes = [];
                var i=0;
                App.effects.data.forEach(function(effect){
                        if(effect.group == "overlay"){
                            App.effects.timeline.gsap.set("#overlay" + effect.id, {display:"none"}, 0);//opacity:0
                            App.effects.timeline.gsap.set("#overlay" + effect.id, {display:"block"}, effect.start/1000);
                            App.effects.timeline.gsap.set("#overlay" + effect.id, {display:"none"}, effect.end/1000);
                        } else if(effect.group == "mute"){
                        } else {
                            App.effects.cropTimes[i++] = [effect.start,effect.end];
                        }
                    },
                    {type: {start: 'Number', end: 'Number'},
                    order: 'start'}
                );
                App.effects.cropTimesCount = i;
                this.gsap.time(t);
                if (typeof callback === 'function'){callback()}
            },
            jumpTo: function(time){
                this.gsap.time(time);
            },
            setDuration: function(duration){
                this.gsap.startTime(0);
                this.update();
            },
            checkCrop:function(time){//in ms
                for(i=0; i < App.effects.cropTimesCount; i++) {
                    if (time > App.effects.cropTimes[i][0] &&
                        time < App.effects.cropTimes[i][1] ){
                        App.player.jumpTo(App.effects.cropTimes[i][1]);
                        // App.player.vjs.currentTime(App.effects.cropTimes[i][1]/1000);
                        break;
                    }
                }
            },
            checkMute:function(time){
                App.player.volume || 1
                var mutes = App.effects.data.get({
                    type: {start: 'Number',end: 'Number'}, 
                    filter: function (it) {return it.group == 'mute' && it.start <= time && it.end >= time; }});
                App.player.vjs.muted(mutes.length > 0);
            }
        },
        timeRange: {
            options: {
                type: "double",
                grid: true,
                values_separator: " → ",
                keyboard: true,
                drag_interval: true,
                min: 0,
                from: 1000,
                min_interval: 5000,
                force_edges: true,
                max: 300000,
                to: 30000,
                step: 100,
                keyboard_step: 1, //in %
                prettify_enabled: true,
                prettify: function(num) {
                    return App.utils.msToTime(num);
                },
                onChange: function(data) {},
                onUpdate: function(data) {}
            },
            slider: {},
            getValue: function(){
                return {
                    start: this.slider.result.from,
                    end: this.slider.result.to,
                    max: this.slider.options.max
                };
            },
            setRange: function(duration){
                this.slider.update({
                    max: duration
                });
            }
        },
        positionRange: {
            options: {
                type: "double",
                grid: true,
                values_separator: " → ",
                keyboard: true,
                drag_interval: true,
                min: 0,
                from: 10,
                min_interval: 10,
                step: 1,
                force_edges: true,
                keyboard_step: 1, //in %
                prettify_enabled: false,
                postfix: "px",
                onChange: function() {
                    App.effects.container.tester.reposition(App.effects.positionRange.getValue());
                }
            },
            optionsX: {
                prefix: "X=",
                max: 640,
                to: 200
            },
            optionsY: {
                prefix: "Y=",
                max: 480,
                to: 200
            },
            sliderX: {},
            sliderY: {},
            getValue: function(){
                return {
                    x1: this.sliderX.result.from,
                    x2: this.sliderX.result.to,
                    y1: this.sliderY.result.from,
                    y2: this.sliderY.result.to
                };
            },
            setRange: function(video){
                this.sliderX.update({
                    max: video.width
                });
                this.sliderY.update({
                    max: video.height
                });
            }
        },
        container: {
            element: {},
            resize: function(dimentions){
                this.element.height(dimentions.height);
                this.element.width(dimentions.width);
            },
            tester: {
                element: {},
                timer: {},
                show: function(){
                    clearTimeout(this.timer);
                    this.element.css("display", "block");
                    this.timer = setTimeout(function(){
                        App.effects.container.tester.element.css("display", "none");},
                        5000);
                },
                reposition: function(position){
                    this.element.css({
                        "left": position.x1 * App.player.currentMeta.videoScale,
                        "top": position.y1 * App.player.currentMeta.videoScale,
                        "width": (position.x2 - position.x1) * App.player.currentMeta.videoScale,
                        "height": (position.y2 - position.y1) * App.player.currentMeta.videoScale
                    });
                    this.show();
                }
            }
        },
        newItem: function(group){
            var item_id = Math.floor(Math.random() * (9000)) + 1000,
                item_time = App.effects.timeRange.getValue(),
                item_pos = App.effects.positionRange.getValue();
            var item_title = "Наложение";
            switch(group){
                case 'crop': item_title = "Вырезка"; break
                case 'mute': item_title = "Отключение звука"; break
                case 'overlay': item_title = "Наложение"; break;
            }
            var new_item = new TimelineItem({id: item_id, group: group, start: item_time.start, end: item_time.end, position: item_pos});

            // new_item.set_position(item_pos, true);
            // new_item.set_range(item_time.start, item_time.end, true);

            if(new_item.group != "overlay") {
                this.checkCropCrossing(new_item, function (ok) {
                    if (ok) {
                        App.effects.data.add(new_item);
                    } else {
                        alert('Неудачно выбран диапазон.\n Попробуйте указать другой диапазон, чтобы не пересекаться с имеющимися элементами группы "'+new_item.title+'".');
                    }
                });
            } else {
                App.effects.data.add(new_item);
                App.effects.overlayItems['overlay'+item_id] = $("<div class='overlay-item' data-item="+ item_id +" id='overlay"+item_id+"'/>");
                App.effects.container.element.append(App.effects.overlayItems['overlay'+item_id] );
                App.effects.overlayItems['overlay'+item_id]
                    .resizable({
                        handles: "n, e, s, w",
                        resize: App.effects.resizeOverlayElement
                    })
                    .css({
                        "left": new_item.position.x1 * App.player.currentMeta.videoScale,
                        "top": new_item.position.y1 * App.player.currentMeta.videoScale,
                        "width": (new_item.position.x2 - new_item.position.x1) * App.player.currentMeta.videoScale,
                        "height": (new_item.position.y2 - new_item.position.y1) * App.player.currentMeta.videoScale
                    });
            }
            this.timeline.update();
        },

        resizeOverlayElement: function(evt, ui){
            var id = $(this).data('item');
            var it = App.effects.data.get(id, {type: {start: 'Number',end: 'Number'}});
            var x1 = ui.position.left;
            var y1 = ui.position.top;
            var x2 = ui.position.left + ui.size.width;
            var y2 = ui.position.top + ui.size.height;
            var video_scale = App.metaByTime(it.start).videoScale;
            it.set_position({
                x1: x1 / video_scale^0, y1: y1 / video_scale^0,
                x2: x2 / video_scale^0, y2: y2 / video_scale^0
            });
            App.effects.updateItem(it);
        },

        setupExternalData: function(){
            App.effects.data.forEach(function(effect){
                    if (!App.effects.overlayItems['overlay'+effect.id]){
                        App.effects.overlayItems['overlay'+effect.id] = $("<div class='overlay-item' data-item="+ effect.id +" id='overlay"+effect.id+"'/>");
                        App.effects.container.element.append(App.effects.overlayItems['overlay'+effect.id] );
                    }
                    App.effects.overlayItems['overlay'+effect.id]
                        .resizable({
                            handles: "n, e, s, w",
                            resize: App.effects.resizeOverlayElement
                        })
                        .css({
                            "left": effect.position.x1 * App.player.currentMeta.videoScale,// App.player.source.data.video_scale,
                            "top": effect.position.y1 * App.player.currentMeta.videoScale,// App.player.source.data.video_scale,
                            "width": (effect.position.x2 - effect.position.x1) * App.player.currentMeta.videoScale,// App.player.source.data.video_scale,
                            "height": (effect.position.y2 - effect.position.y1) * App.player.currentMeta.videoScale// App.player.source.data.video_scale
                        });
                },
                {type: {start: 'Number', end: 'Number'}, order: 'start', filter: function(it){ 
                    return it.group == 'overlay';
                }}
            );
            App.effects.data.forEach(function(effect){effect.update_content();});
            this.timeline.update();
        },
        deleteItem: function(id){
            App.effects.overlayItems['overlay'+id].remove();
            delete App.effects.overlayItems['overlay'+id];
            this.timeline.update();
        },
        updateItem: function(item){
            App.effects.data.update(item);
            var wasPlaying = !App.player.vjs.paused();
            if(wasPlaying) App.player.vjs.pause();
            this.timeline.update(function(){
                if(wasPlaying) App.player.vjs.play();
            });
        },
        checkCropCrossing: function(checking_item, callback){
            if(typeof checking_item.start != 'number'){checking_item.start = checking_item.start.getTime();}
            if(typeof checking_item.start != 'number'){checking_item.end = checking_item.end.getTime();}
            var crossing_items = App.effects.data.get({
                type: {start: 'Number',end: 'Number'},
                filter: function (filter_item) {
                    return (
                        filter_item.id != checking_item.id && filter_item.group == "crop" && checking_item.group == "crop" &&
                        (  (filter_item.start >= checking_item.start && filter_item.end <= checking_item.end)
                            || (filter_item.start < checking_item.start && filter_item.end > checking_item.start)
                            || (filter_item.start < checking_item.end && filter_item.end > checking_item.end)
                            || (filter_item.start == checking_item.end) || (filter_item.end == checking_item.start)
                        )
                    );
                }
            });
            if(crossing_items.length > 0){
                callback(false);
            } else {
                callback(true);
            }
        },
        checkUpdateAllowed: function(item, callback){
            if(item.group === "crop") {
                this.checkCropCrossing(item, function(ok){
                    if(ok){
                        // item.content = 'Вырезка<div class="vis-item-tr">' + App.utils.msToTime(item.start) + ' - ' + App.utils.msToTime(item.end) +'</div>';
                        item.update_content();
                        callback(item);
                        App.effects.updateItem(item);
                    } else {
                        callback(false);
                        alert('Элементы даннной группы не могут пересекаться.');
                    }
                });
            } else if(item.group === "mute"){
                // item.content = 'Отключение звука<div class="vis-item-tr">' + App.utils.msToTime(item.start) + ' - ' + App.utils.msToTime(item.end) +'</div>';
                item.update_content();
                callback(item);
                this.updateItem(item);
            } else {
                // item.content = 'Наложение <span>' + App.utils.positionStr(item.position) +'</span>' + '<div class="vis-item-tr">' + App.utils.msToTime(item.start) + ' - ' + App.utils.msToTime(item.end) +'</div>';
                item.update_content();
                callback(item);
                this.updateItem(item);
            }
        },
        loadData: function(data) {
            App.effects.data.clear();
            App.effects.data.add(data);
            this.setupExternalData();
            // App.timeline.vis.fit();
        },

        startProcessing: function () {
            var data = this.getData();
            $.post('run', JSON.stringify(data), 
                function(success){
                    // App.updateVideoItems();
                    App.showModal(success.id, "files/" + success.id);
                }, "json");
            // jQuery.post( url [, data ] [, success ] [, dataType ] )
            // console.log("started", {files: [App.player.source.data.src], filters: data});
        },

        getData: function(){
            var filters = App.effects.data.get({
                type: {start: 'Number', end: 'Number'},
                fields: ['group', 'start', 'end', 'position', 'title']
            });
            var data = {
                id: App.data.id,
                title: App.data.title,
                date: App.data.date,
                filename: App.data.filename,
                sources: App.data.sources,
                filters: filters
            };
            return data;
        },

        returnToOpener: function(){
            // if (window.opener) {
            //     if (window.opener.name) { 
            //         window.open("",window.opener.name); 
            //     }
            //     else { 
            //         window.opener.focus(); 
            //     }
            // }
            window.close();
        },

        cancel: function(){
            var fields = ['group', 'start', 'end', 'position'];
            var currentFilters = JSON.stringify(this.getData().filters, fields);
            var originalFilters = JSON.stringify(App.originalData.filters, fields);
            if (currentFilters == originalFilters 
             || confirm('Вы уверены, что хотите закрыть редактор без сохранения данных?')){
               this.returnToOpener(); 
            }
        },

        saveData: function() {
            if (!confirm("Вы уверены, что хотите сохранить отредактированную версию видеозаписи?")) 
                return;

            var self = this;
            var data = self.getData();
             $.ajax({
                type: "PUT",
                xhrFields: { withCredentials: true },
                url: App.dataUrl,
                //dataType: 'json',
                async: true,
                data: JSON.stringify(data)})
              .success(function(result){
                // alert('Данные успешно сохранены');
                console.log('success', result);
                self.returnToOpener();
              })
              .error(function(error){
                alert('Проблема при сохранении данных');
                console.log('error', error);
              });
        },
        init: function(callback){
            this.data = new vis.DataSet([]);
            this.timeline.gsap = new TimelineLite(App.effects.timeline.options);

            this.container.element = $("#vep_player_effects_container");
            this.container.tester.element = $("#vep_player_effects_tester");

            $("#effects_time_range").ionRangeSlider(this.timeRange.options);
            this.timeRange.slider = $("#effects_time_range").data("ionRangeSlider");

            $("#effects_position_x").ionRangeSlider(
                $.extend({}, this.positionRange.options, this.positionRange.optionsX));
            this.positionRange.sliderX = $("#effects_position_x").data("ionRangeSlider");

            $("#effects_position_y").ionRangeSlider(
                $.extend({}, this.positionRange.options, this.positionRange.optionsY));
            this.positionRange.sliderY = $("#effects_position_y").data("ionRangeSlider");

            $("#filter_crop_add_btn").click(function(){App.effects.newItem('crop')});
            $("#filter_mute_add_btn").click(function(){App.effects.newItem('mute')});
            $("#filter_overlay_add_btn").click(function(){App.effects.newItem('overlay')});

            $("#external_data_save_btn").click(function(){App.effects.saveData()});
            $("#external_data_start_btn").click(function(){App.effects.startProcessing()});

            if (typeof callback === 'function'){callback()}
        }
    },
    player: {
        options: {
            controls: true,
            autoplay: false,
            preload: false,
            poster: "",
            loop: false
        },
        vjs: {},
        init: function(callback){
            App.player.vjs = videojs(
                'vep_app_player',
                App.player.options,
                function(){
                    this.on('loadedmetadata', function () {
                        // console.log('isLoading', App.player.isLoading, 'seekRequested', App.player.seekRequested);
                        App.player.isLoading = false;
                        App.effects.setupExternalData();
                        if (App.player.seekRequested)
                            App.player.jumpTo(App.player.seekRequested);
                    });

                    this.on('play', function() {
                        this.autoplay(false);
                    });
                    this.on('ended', function() {
                        var t = App.player.currentMeta.startMs + this.currentTime()*1000^0;
                        console.log("The audio has ended", t);
                        this.autoplay(true);
                        App.player.jumpTo(t);
                    });
                    this.on('timeupdate', function () {
                        // time (by player) - floating point number like 84.961814 (sec)
                        var t = App.player.currentMeta.startMs + this.currentTime()*1000^0;
                        $("#vep_player_current_time").html(App.utils.msToTime(t));

                        App.effects.timeline.checkCrop(t);
                        App.effects.timeline.checkMute(t);
                        App.timeline.playerTime.setTime(t);
                        App.effects.timeline.jumpTo(t / 1000);
                    });
                    if (typeof callback === 'function'){callback()}
                }
            );
        },
        source: {
            data: {
                src: "",
                width: 0,
                height: 0,
                duration: 0
            },
        },
        open: function(video_meta){
            this.isLoading = true;
            this.currentMeta = video_meta;
            this.vjs.src(video_meta.url);
        },
        jumpTo: function(time){
            if (this.isLoading) {
                this.seekRequested = time;
                return;
            }

            var current = App.metaByTime(time);
            if (!current) return;
            if (this.currentMeta && current.idx == this.currentMeta.idx){
                var jump = time - current.startMs;
                this.seekRequested = false;
                this.vjs.currentTime(jump/1000);
            } else {
                this.seekRequested = time;
                this.open(current);
            }

            // time in milliseconds
            
        }
    },
    timeline: {
        vis: {},
        options: {
            align: 'auto',
            selectable: true,
            multiselect: false,
            multiselectPerGroup: false,
            editable: {
                add: false,
                remove: true,
                updateGroup: false,
                updateTime: true
            },
            groupEditable: false,
            groupOrder: 'order',
            min: 0,
            start: 0,
            end: 60000, // 1 min
            max: 300000, // 5 min
            throttleRedraw: 10,
            showCurrentTime: false,
            moveable: true,
            zoomable: true,
            zoomMax: 18000000, //5 hours
            zoomMin: 100, //ms
            orientation: {
                axis: 'top',
                item: 'top'
            },
            margin: {
                axis: 5,
                item: {
                    horizontal: 0,
                    vertical: 10
                }
            },
            showMajorLabels: false,
            showMinorLabels: true,
            format: {
                minorLabels: {
                    millisecond:'HH:mm:ss.SSS',
                    second:     'HH:mm:ss.SS',
                    minute:     'HH:mm:ss',
                    hour:       'HH:mm:ss',
                    weekday:    'ddd D',
                    day:        'D',
                    month:      'MMM',
                    year:       'YYYY'
                },
                majorLabels: {
                    millisecond:'HH:mm:ss',
                    second:     'HH:mm',
                    minute:     'HH',
                    hour:       'ddd D MMMM',
                    weekday:    'MMMM YYYY',
                    day:        'MMMM YYYY',
                    month:      'YYYY',
                    year:       ''
                }
            },
            moment: function(date) {
                return vis.moment(date).utc();
            },
            onUpdate: function (item, callback) {
                App.effects.checkUpdateAllowed(item, function(checked_item){
                    if(checked_item){
                        callback(checked_item);
                        App.effects.updateItem(item);
                    } else {
                        callback(null);
                    }
                });
            },
            onMove: function(item, callback){
                App.effects.checkUpdateAllowed(item, function(checked_item){
                    if(checked_item){
                        callback(checked_item);
                        App.effects.updateItem(item);
                    } else {
                        callback(null);
                    }
                });
            },
            onRemove: function(item, callback){
                if(item.group == "overlay"){
                    App.effects.deleteItem(item.id);
                }
                callback(item);
            }
        },
        onSelect: function(item){

        },
        playerTime: {
            id: 'ved_timeline_player_time',
            setTime: function(ms){
                App.timeline.vis.setCustomTime(ms, this.id);
                App.timeline.vis.moveTo(ms,false);
            },
            setDuration: function(duration){
                App.timeline.vis.setOptions({
                    'end': duration,
                    'max': duration
                });
            }
        },
        init: function(callback){
            this.vis = new vis.Timeline(document.getElementById('vep_timeline'), App.effects.data, this.options);
            var groups = [
                {
                    id: 'crop',
                    content: 'Вырезка',
                    className: 'crop-group',
                    title: 'Группа фильтров обрезки видео'
                },
                {
                    id: 'mute',
                    content: 'Отключение звука',
                    className: 'mute-group',
                    title: 'Группа фильтров тишины'
                },
                {
                    id: 'overlay',
                    content: 'Наложение',
                    className: 'overlay-group',
                    title: 'Группа фильтров наложения'
                }
            ];
            this.vis.setGroups(groups);
            this.playerTime.id = this.vis.addCustomTime(1 , this.playerTime.id);
            this.vis.on('timechange', function (event) {
                App.player.jumpTo(event.time.getTime());
            });
            this.vis.on('select', function (evt) {
                if (evt.items.length == 1){
                    App.timeline.onSelect(App.effects.data.get(evt.items[0]))
                }
            });
            if (typeof callback === 'function'){callback()}
        }
    },

    utils: {
        msToTime: function (mill) {
            var ms, secs, mins, hrs;
            ms = mill % 1000;
            s = (mill - ms) / 1000;
            secs = s % 60;
            s = (s - secs) / 60;
            mins = s % 60;
            hrs = (s - mins) / 60;

            return ((hrs<10?'0':'') + hrs) + ':' + ((mins<10?'0':'') + mins) + ':' + ((secs<10?'0':'') + secs)
                        + '.' + ((ms<10?'00':ms<100?'0':'') + ms);
        },
        positionStr: function(it){
            return it.x1 + ',' + it.y1 + '-' + it.x2 + ',' + it.y2;
        }
    },

    modalCheckTimer: null,

    closeModal: function(){
        clearTimeout(this.modalCheckTimer);
        this.modalCheckTimer = null;
        $('.vep-modal-title').text('<Name>');
        $('.vep-modal-title').attr('href', '');
        $('.vep-modal-video').attr('src', '');
        $('.vep-modal').addClass('hidden');
    },

    showModal: function(name, src){
        $('.vep-modal-title').text(name);
        $('.vep-modal').removeClass('hidden');
        $('.vep-modal-progress').val(0);
        var fnCheck = function(){
            clearTimeout(this.modalCheckTimer);
            this.modalCheckTimer = null;
            $.get('check/'+name)
             .done((function(info){
                if(info.done){
                    $('.vep-modal-title').attr('href', src);
                    $('.vep-modal-video').show().attr('src', src);
                    $('.vep-modal-progress').val(100);
                } else if (info.error){
                    $('.vep-modal-video').hide();
                    $('.vep-modal-video-container')
                    .append($("<h3>Error</h3>"))
                    .append($("<div></div>").text(info.error));
                } else if (info.progress >= 0){
                    $('.vep-modal-progress').val(info.progress);
                    checkTimer = setTimeout(fnCheck, 1000);
                }
             }).bind(this))
        };
        (fnCheck.bind(this))();
    },

    setActiveTab: function(target_id){
        $("#filter_pane_"+target_id).siblings().slideUp(
            'slow',
            function(){
                $("#filter_pane_"+target_id).slideDown('slow');
            });
        $()
        $('#filter_tab_'+target_id).addClass('active').siblings().removeClass('active');
    },

    title: function(title, date){
        $('head title').text('Дело ' + title + ' от ' + date);
        $('.project-title .title').text(title);
        $('.project-title .date').text(date);
    },

    error: function(text){
        $('.vep-player-not-initialized span').html(text);
    },

    metaByTime: function(timeMs){
        var files = App.data.videoInfo.metadata;
        var selected = files.filter(function(it){
            return timeMs >= it.startMs && timeMs < it.stopMs;
        });
        if (selected.length == 0) return null;
        return selected[0];
    },

    init: function (callback) {
        var totalDuration = App.data.videoInfo.totalDuration;
        var firstVideo = App.data.videoInfo.metadata[0];
        var videoWidth = firstVideo.width * firstVideo.videoScale;
        var videoHeight = firstVideo.height * firstVideo.videoScale;

        $("#project_video_items").css('opacity', '1');
        $(".filter-nav .nav-item:not(active)").click(function(){
            var target_id = $(this).attr('target');
            App.setActiveTab(target_id);
        });
        App.effects.init(function(){
            App.timeline.init(function(){
                App.timeline.playerTime.setDuration(totalDuration*1000^0);
                App.effects.timeRange.setRange(totalDuration*1000^0);
                App.effects.timeline.setDuration(totalDuration);

                App.effects.setupExternalData();

                App.effects.positionRange.setRange({
                    width: firstVideo.width,
                    height: firstVideo.height});
                App.effects.container.resize({
                    width: videoWidth,
                    height: videoHeight});

                App.player.init(function(){
                    var $content = $(App.player.vjs.contentEl());
                    setTimeout(function(){
                        $content.height(videoHeight);
                        $content.width(videoWidth);
                    }, 1);

                    $('.vep-modal-close').click(function(){
                        App.closeModal();
                    });

                    $(".vep-player-not-initialized").fadeOut();
                    $("#project_video_items option[value='']").remove();
                    $(".filter-container").css('opacity', '1');

                    App.player.jumpTo(0);
                    if (typeof callback === 'function'){callback()}
                });
            });
        });
    }
};

function loadData(url){
    return $.ajax({url:url, xhrFields: { withCredentials: true }});
}

function isDebug() {
    var found = window.location.search.match(/debug=([^&]+)/);
    return found && found[1] == '1';
}

function getDataUrl(){
    var dataUrl0 = window.location.search.match(/data-url=([^&]+)/);
    var dataUrl = null;
    if (dataUrl0 && dataUrl0.length == 2)
        dataUrl = decodeURIComponent(dataUrl0[1]);
    return dataUrl;
}

function calcDurationAsync(files, timeout){
    timeout = timeout || 3000;
    var urls = files.map(function (it) { return it.url });
    var result = $.Deferred();
    var loadPromises = urls.map(function(url, idx){
        var vid = document.createElement('video');
        vid.autoPlay = false;
        var d = $.Deferred();
        var t = setTimeout(function(){ 
            d.reject({msg: 'Таймаут ожидания загрузки видео (' + idx + ')', data: url}); 
        }, timeout);
        vid.onerror = function(){
            clearTimeout(t);
            d.reject({msg: 'Проблема загрузки видео (' + idx + ')', data: url, args: Array.prototype.slice.call(arguments)});
        };
        vid.onloadedmetadata = function() { 
            clearTimeout(t);
            d.resolve({
                idx: idx,
                url: url,
                duration: vid.duration,
                width: vid.videoWidth,
                height: vid.videoHeight,
                videoScale: 480 / vid.videoHeight
            });
            vid = null;
        };
        vid.src = url;
        return d;
    });

    var total_timeout = setTimeout(function(){
        result.reject('Таймаут ожидания загрузки видео');
    }, timeout * 3);

    $
        .when.apply($, loadPromises)
        .fail(function(f){ result.reject(f); })
        .then(function(){
            window.clearTimeout(total_timeout);
            var metadata = Array.prototype.slice.call(arguments);
            metadata.forEach(function(it, idx){
                var prev = idx == 0 ? {stopMs: 0} : metadata[idx-1];
                it.startMs = prev.stopMs;
                it.stopMs = it.startMs + it.duration*1000^0;
            });
            var totalDuration = metadata.reduce(function(acc,m){return m.duration+acc;}, 0);
            result.resolve({
                totalDuration: totalDuration,
                metadata: metadata
            });
        });
    return result;
}

$(function() {
    $("#external_data_cancel_btn").click(function(){ App.effects.cancel(); });

    if (isDebug()){
        $('#external_data_start_btn').show();
    }
    var dataUrl = getDataUrl();
    if (!dataUrl){
        App.error('Сервер данных недоступен');
        return;
    }
    loadData(dataUrl)
        .error(function(){
            console.log('error', arguments);
            App.error('Сервер данных недоступен');
        })
        .success(function(data){
            if (typeof(data) != 'object'){
                App.error('Некорректные начальные данные');
                return;
            }

            calcDurationAsync(data.sources)
                .fail(function(fail){
                    console.log('video error', fail);
                    if (typeof(fail) == 'object' && fail.msg){ App.error(fail.msg) } 
                    else { App.error(fail) }
                })
                .then(function(info){
                    console.log('info', info);
                    
                    App.dataUrl = dataUrl;
                    $("#external_data_save_btn").show();
                    App.data = data;
                    App.originalData = JSON.parse(JSON.stringify(data));
                    App.data.videoInfo = info;
                    App.title(
                        data.title || 'не указано',
                        data.date || 'не указано');
                    App.init(function() {
                        App.effects.loadData(data.filters.map(function(it){ return new TimelineItem(it); }));
                    });
                })
        })
});