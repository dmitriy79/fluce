{application,iptv,
             [{description,"iptv"},
              {vsn,"1"},
              {registered,[]},
              {applications,[stdlib,kernel,corelib]},
              {mod,{iptv_app,[]}},
              {env,[]},
              {modules,[iptv,iptv_api,iptv_app,iptv_db,iptv_epg,
                        iptv_load_balancer,iptv_sup,iptv_time,iptv_www]}]}.