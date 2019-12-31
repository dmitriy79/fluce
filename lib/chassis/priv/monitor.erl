#!/opt/flussonic/bin/escript
%%
%%! -env ERL_LIBS /opt/flussonic/lib

main([]) ->
  Node = chassis_control:setup(),

  spawn(fun() ->
    chassis_control:loop_events(Node, fun(Evt) ->
      case Evt of
        {'$event', #{time := T, message := Text}} -> io:format("~s ~s\n", [T, Text]);
        _ -> io:format("~p\n", [Evt])
      end      
    end)
  end),
  chassis_control:loop_shell().
