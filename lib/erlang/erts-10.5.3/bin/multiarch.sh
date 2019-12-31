#!/bin/sh
ARCH=`uname -i`
if [ "$ARCH" = "unknown" ]; then
  # Debian 9 gives unknown on this call
  ARCH=`uname -m`
fi
APP=`basename $0`

# Нужно именно $@ и в кавычках:
#
# b.sh 'My first' 'My second'
# With someApp "$*", 
# someApp would receive a single argument 'My first My second'. 
# With someApp "$@", someApp would receive two arguments, 'My first' and 'My second'.
#
# Без кавычек будет 4 аргумента: 'My', 'first', 'My', 'second'
#
exec "/opt/flussonic/lib/erlang/erts-10.5.3/bin/${ARCH}-linux-gnu/${APP}" "$@"

