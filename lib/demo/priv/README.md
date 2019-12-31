Demo application framework
==========================


Here goes demo application framework that allows to launch multiple flussonic instances together
in a single cluster for demonstration needs.

Structure is following:

* *profile.conf*  file that indicates that this folder is an demo specification folder.
* *instances/NNN.conf*  files that describe each flussonic instance.
* *configs/CCC.conf*  flussonic configuration files 
* *www/index.html*  index.html for http://localhost:9000/
* *www/*  webroot: here may be all other files


Configuration syntax
--------------------

*profile.conf* is an erlang term config. It supports following keys:

* *profile_name*  - atom with profile name.


*instances/NNN.conf* - configuration for one flussonic instance.  The name *NNN* is used as a node name
and as a name of configuration file. This file is an erlang term config and it supports following keys:

* *tags* - list of atoms with tags for this instance
* *script* - if you need something extra, you can add this erlang script for this instance
* *autostart* - if true, then this instance will be started on boot


*configs/NNN.conf* - path is calculated automatically for each *instances/NNN.conf*


Script usage
------------

The script of instance can be used in 2 ways:  adding info to state and running commands.

First is a function: *config(#{} = Spec) -> Added = #{}.*  You can add some keys to instance specification.

Second is calling a command: *CommandName(#{name := Name}) -> ok*.  This can be used from API.



HTTP API
--------

*GET /demo/api/instances* - list of instance specifications. If you have added script, it would add keys to each specification. In each spec, you can have access to config — this is a flussonic status and config.streams2 - all running streams

*POST /demo/api/instances/NAME* - launch instance

*DELETE /demo/api/instances/NAME* - stop instance

*POST /demo/api/command* with JSON body: *{name: Name, command: Command, other_options...}* - run a command from script, defined for instance Name








