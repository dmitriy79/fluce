{application,ssh_agent,
             [{description,"SSH reverse proxy agent"},
              {vsn,"1"},
              {registered,[]},
              {applications,[kernel,stdlib,cowboy,rproxy,lhttpc]},
              {mod,{ssh_agent_app,[]}},
              {env,[]},
              {modules,[ssh_agent,ssh_agent_app,ssh_agent_sup]}]}.
