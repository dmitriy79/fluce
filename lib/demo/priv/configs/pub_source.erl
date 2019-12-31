-module(pub_source).
-compile(export_all).

config(#{alive := Alive}) ->
  case whereis(pub_stress_client) of
    undefined when Alive == true -> 
      {ok, Pid} = rtmp_publish_stress_test:start_link(pub_stress_client, <<"file://priv/bunny.mp4">>, fun() ->
        SortKey = online_streams,
        SrvList1 = nanomysql:select("select * from servers where available=1 order by "++atom_to_list(SortKey)++" desc limit 1", 
          "mysql://flussonic:auth@pub_srv1.local:5561/cluster?login=init_db"),
        SrvList2 = lists:sort(fun(U1,U2) -> maps:get(SortKey,U1) =< maps:get(SortKey,U2) end, SrvList1),
        [Server|_] = SrvList2,
        io:format("~80p\n", [  [{maps:get(hostname,U),maps:get(SortKey,U)} || U <- SrvList2] ]),
        #{hostname := Host, rtmp_port := Port} = Server,
        StreamName = integer_to_list(erlang:unique_integer([positive,monotonic])),
        Timer = 30000 + rand:uniform(30000),
        erlang:send_after(Timer, self(), stop),
        iolist_to_binary(["rtmp://", Host, ":", integer_to_list(Port), "/pub/", StreamName])
      end),
      unlink(Pid);
    Pid when is_pid(Pid) andalso Alive =/= true ->
      erlang:exit(Pid, shutdown);
    _ ->
      ok
  end,

  ClientCount = try rtmp_publish_stress_test:client_count(pub_stress_client)
  catch
    _:_ -> 0
  end,
  #{stress_client_count => ClientCount}.


add_clients(#{count := Count}) when is_integer(Count) ->
  rtmp_publish_stress_test:change_count(pub_stress_client, Count).
