#!/bin/sh

export HOME=/var/run/flussonic
export ERL_LIBS=/opt/flussonic/lib
export PATH=/opt/flussonic/bin:$PATH


if [ $# -lt 1 ]; then
  echo "$0 coder_restart 1|coder_off 1|coder_on 1|status|shell|monitor"
elif [ "$1" = "shell" ]; then
  exec erl -kernel inetrc '"/opt/flussonic/.inetrc"' -name chassis-debug@server.l -remsh chassis@server.l
elif [ "$1" = "monitor" ]; then
  exec /opt/flussonic/lib/chassis/priv/monitor.erl
else
  exec erl -kernel inetrc '"/opt/flussonic/.inetrc"' -noinput -run chassis_control main text $* -run init stop
fi


