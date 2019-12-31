-record(aac_config, {
  type,
  ext_type,
  adts_header,
  sample_rate,
  channels,
  channel_count,
  samples_per_frame
}).

-define(AOT_NULL, 0).
-define(AOT_SBR, 5).
-define(AOT_PS, 29).

-define(AOT_MAIN, 1).
-define(AOT_ER_AAC_LD, 23).
