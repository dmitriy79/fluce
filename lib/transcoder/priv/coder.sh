#!/bin/sh

export ERL_CRASH_DUMP_SECONDS=0

if [ -d _build/default/lib ]; then
  export ERL_LIBS=_build/default/lib
elif [ -d /opt/flussonic/lib ]; then
  export ERL_LIBS=/opt/flussonic/lib
  export PATH=/opt/flussonic/bin:$PATH
fi


CONFIG="/opt/flussonic/lib/transcoder/priv/sys.config"
NODENAME=coder

if [ ! -f $CONFIG -a -f sys.config ]; then
  CONFIG=sys.config
fi

while [ ! -z "$1" ]; do
  case "$1" in
    "-config")
      CONFIG="$2"
      shift
      ;;
    "-name")
      NODENAME="$2"
      shift
      ;;
    *)
      break
  esac
  shift
done


if [ ! -z "$CONFIG" ]; then
  CONFIG="-config $CONFIG"
fi

exec erl $CONFIG +zdbbl 65536 -name $NODENAME -boot start_sasl -sasl errlog_type all -s dedicoder start $*

