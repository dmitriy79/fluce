%
% load nif like in this piece of code
% `?load_nif(decklink, priv, "decklink")`
% it will not complain if there is no such module
%
% it is designed as a macro because one can not
% call erlang:load_nif from another module
%
-define(load_nif(Name, Subdir, ModulePrefix),
  Path = case code:lib_dir(Name, Subdir) of
    P when is_list(P) -> P;
    _ -> "./priv"
  end,
  % check if there is a file on disk
  NifName = Path ++ "/" ++ ModulePrefix ++ "_" ++ atom_to_list(corelib:arch()),
  case file:read_file_info(NifName ++ ".so") of
    {ok, _} ->
      case erlang:load_nif(NifName, 0) of
        ok -> ok;
        {error, Error} ->
          io:format("~s nif load failure: ~p\n", [ModulePrefix, Error]),
          ok
      end;
    {error, enoent} -> ok
  end).
