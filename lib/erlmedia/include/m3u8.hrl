


-record(m3u8_entry, {
  url :: binary(),
  is_media = false,
  duration :: undefined | non_neg_integer(),
  size = undefined :: undefined | non_neg_integer(),
  number :: non_neg_integer(),
  offset :: non_neg_integer(),
  utc = undefined :: undefined | non_neg_integer(),
  load_time = undefined :: undefined | non_neg_integer(),
  key = undefined :: undefined | {Type::atom(), [{Key::atom(),Value::any()}]},
  body = undefined :: undefined | binary(),
  discontinuity = false :: true | false,
  pts :: non_neg_integer(),
  ad = #{}
}).

-type m3u8_entry() :: #m3u8_entry{}.

-record(m3u8_playlist, {
  url = undefined :: undefined | binary(),
  avg_bitrate = undefined :: undefined | non_neg_integer(),
  peak_bitrate = undefined :: undefined | non_neg_integer(),
  sequence = undefined :: undefined | non_neg_integer(),
  type = live :: vod | event | live,
  repeat = false,
  codecs = [] :: list(binary()),
  resolution :: undefined | {non_neg_integer(),non_neg_integer()},
  target_duration,
  allow_cache,
  version,
  entries = [] :: list(m3u8_entry())
}).

-type m3u8_playlist() :: #m3u8_playlist{}.


-record(m3u8_mbr_playlist, {
  url = undefined :: undefined | binary(),
  playlists = [] :: list(m3u8_playlist())
}).


-type m3u8_mbr_playlist() :: #m3u8_mbr_playlist{}.

-record(m3u8_ad_slot, 
        {time = undefined,
         duration = undefined}).
-type m3u8_ad_slot() :: #m3u8_ad_slot{}.

-record(m3u8_ad_playlist, 
        {slots = []           :: list(m3u8_ad_slot()),
         playlist = undefined :: undefined | m3u8_playlist() }).
-type m3u8_ad_playlist() :: #m3u8_ad_playlist{}.
