-module(lb_master).
-compile(export_all).

config(#{alive := Alive}) ->
  case whereis(hls_demo_lb_client) of
    undefined when Alive == true -> 
      {ok, Pid} = hls_stress_test:start_link(hls_demo_lb_client, "http://lb_master.local:5140/fake"),
      unlink(Pid);
    Pid when is_pid(Pid) andalso Alive =/= true ->
      erlang:exit(Pid, shutdown);
    _ ->
      ok
  end,

  ClientCount = try hls_stress_test:client_count(hls_demo_lb_client)
  catch
    _:_ -> 0
  end,
  #{stress_client_count => ClientCount}.


add_clients(#{count := Count}) when is_integer(Count) ->
  hls_stress_test:change_count(hls_demo_lb_client, Count).
