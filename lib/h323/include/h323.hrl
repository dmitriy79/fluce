-define(TERMINAL_PRODUCT, "Flussonic").
-define(TERMINAL_VERSION, "1.0").

-define(TERMINAL_TYPE, 50).

-define(H245v10, {0,0,8,245,0,10}).
-define(H241_H264, {0,0,8,241,0,0,1}).
-define(H241_AAC, {0,0,8,245,1,1,0}). 


-define(DEFAULT_RASPORT,1719).
-define(DEFAULT_CALLPORT,1720).

-define(UPDATE_INTERVAL, 10000).

-record(h323_rtp, {
  channel,
  track_id,
  rtp_port,
  rtcp_port,
  drop_count = 0,
  ssrc,
  seq,
  decoder
}).
