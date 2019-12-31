
-record(pes_packet, {
  pid,
  dts,
  pts,
  codec,
  track_id,
  body
}).



-define(PAT_PID, 0).
-define(DEF_PMT_PID, 4095).
-define(DEF_CAT_PID, 1).
-define(DEF_NIT_PID, 16). % ECM
-define(DEF_SDT_PID, 17). % EMM
-define(DEF_EIT_PID, 18). % EPG
-define(DEF_RST_PID, 19).
-define(DEF_TDT_PID, 20). % TOT here

-define(DEF_VIDEO0_PID, 210).
-define(DEF_AUDIO0_PID, 220).
-define(DEF_TEXT0_PID, 250).

-define(MPEGTS_STREAMID_MPEG2, 2).
-define(MPEGTS_STREAMID_MPGA1, 3).
-define(MPEGTS_STREAMID_MPGA2, 4).
-define(MPEGTS_STREAMID_AAC, 192).
-define(MPEGTS_STREAMID_H264, 224).

% ETSI TS 102 366  (AC3) 
% A.2.2 Stream_id
% The value of stream_id in the PES header shall be 0×BD (indicating private_stream_1)
-define(MPEGTS_STREAMID_SUBTITLE, 189).
-define(MPEGTS_STREAMID_AC3, 189).
-define(MPEGTS_STREAMID_EAC3, 239).
-define(MPEGTS_STREAMID_PCMA, 206).
