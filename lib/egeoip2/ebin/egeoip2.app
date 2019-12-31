{application,egeoip2,
             [{description,"geolocation by IP"},
              {vsn,"1.1"},
              {modules,[egeoip2,egeoip2_app,egeoip2_mmdb,egeoip2_sup]},
              {registered,[]},
              {env,[{dbfile,country}]},
              {mod,{egeoip2_app,[]}},
              {applications,[kernel,stdlib]}]}.
