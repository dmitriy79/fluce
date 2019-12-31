#!/bin/sh


[ -z "$NODE" ] && NODE="chassis@server.l"


if [ -z "$ERLHOME" ]; then
  HOME=/var/run/flussonic
else
  HOME="$ERLHOME"
fi

[ -z "$LOGDIR" ] && LOGDIR=/var/log/chassis
[ -z "$CONFIG" ] && CONFIG=/etc/chassis.conf

export ERL_CRASH_DUMP_SECONDS=0
ERLARGS=""
BOOTARGS=""


while [ ! -z "$1" ]; do
  case "$1" in
    "-noinput")
      ERLARGS="$ERLARGS -noinput"
      ;;
    "-h")
      HOME="$2"
      shift
      ;;
    "-l")
      LOGDIR="$2"
      shift
      ;;
    "-d")
      DEBUG="debug"
      ;;
    "-c")
      CONFIG="$2"
      shift
      ;;
    *)
      break
  esac
  shift
done

export HOME
BOOTARGS="$BOOTARGS log_dir $LOGDIR $DEBUG config $CONFIG "


if [ -d _build/prod/opt/flussonic/lib/ ]; then
  export ERL_LIBS=_build/prod/opt/flussonic/lib/
elif [ -d _build/default/lib ]; then
  export ERL_LIBS=_build/default/lib
else
  export PATH=/opt/flussonic/bin:$PATH
  export ERL_LIBS=/opt/flussonic/lib
fi


exec erl \
    -name $NODE -boot start_sasl -sasl errlog_type error $ERLARGS \
    -run chassis start_app $BOOTARGS

