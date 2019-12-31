#!/bin/sh

extfile=v3.ext
[ $# -gt 0 ] && extfile=$1

set -x

# make CA
openssl genrsa -out flussonic-ca.key 2048
openssl req -x509 -new -nodes -key flussonic-ca.key -sha256 -days 365 -out flussonic-ca.crt -subj '/C=US/ST=TN/CN=flussonic.local/O=Flussonic, LLC'

# make server key
openssl genrsa -out flussonic.key 2048
openssl req -new -key flussonic.key -out flussonic.csr -subj '/C=US/ST=TN/CN=flussonic.local/O=Flussonic, LLC'
openssl x509 -req -days 365 -in flussonic.csr -CA flussonic-ca.crt -CAkey flussonic-ca.key -CAcreateserial -out flussonic.crt -extfile $extfile

ls -l flussonic-ca.crt flussonic.crt



# Add to Google Chrome:

# Settings -> Advanced -> Manage certificates -> AUTHORITIES -> IMPOTRT ->
#   flussonic/priv/ssl/flussonic-ca.crt
#
# [x]  Trust this certificate for identifying websites



# curl example:

# curl --cacert priv/ssl/flussonic-ca.crt https://localhost:8443/flussonic/api/whoami
