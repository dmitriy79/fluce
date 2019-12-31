-module(as_camera).
-compile(export_all).


config(#{}) ->
  AgentAliveErl = autostart_agent(demo_agent_erl, peeklio),
  AgentAliveNative = autostart_agent(demo_agent_native, peeklio_c),
  #{agent_alive_erl => AgentAliveErl, agent_alive_native => AgentAliveNative}.


autostart_agent(Name, Mod) ->
  Id = list_to_atom("as_"++atom_to_list(Name)),
  case demo_slave:call(as_camera, erlang, whereis, [Id]) of
    undefined ->
      Host = case Mod of
        peeklio_c -> "127.0.0.1";
        _ -> "as_endpoint.local"
      end,
      URL = "http://"++atom_to_list(Name)++":mypass@"++Host++":5242/endpoint/connect",
      Args = #{autoconnect => true, local => Id},
      case demo_slave:call(as_camera, Mod, start_link, [URL, Args]) of
        {ok, Pid} ->
          unlink(Pid);
        _Err ->
          io:format("~p\n",[_Err]),
          ok
      end;
    _ ->
      ok
  end,
  demo_slave:call(as_camera, erlang, whereis, [Id]) =/= undefined.

  
