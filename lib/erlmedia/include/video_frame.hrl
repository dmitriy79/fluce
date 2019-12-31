-ifndef(VIDEO_FRAME_TYPES).
-define(VIDEO_FRAME_TYPES, true).

-type(frame_content() ::audio|video|metadata|application).
-type(frame_flavor()  ::frame|keyframe|config|disposable).
-type(frame_codec()   ::h264|sorenson|vp6|vp6f|mpeg4|mpeg2|aac|mp3|pcma|pcmu|pcm|pcm_le|g726_16|speex|nellymoser|nellymoser8|vp8|vp9|vorbis|scte35).
-export_type([frame_content/0, frame_codec/0]).

-type(frame_video_pix_fmt() ::yuv420p|yuvj420p|yuv422p|yuv444p|yuv420p10|yuv422p10|yuv444p10|yuv420p12|yuv422p12|yuv444p12|gray8|gray10|gray12|nv12|p016).
-type(frame_video_color_space() ::gbr|bt709|unknown|reserved|fcc|bt470bg|smpte170m|smpte240m|ycgco|bt2020nc|bt2020c|smpte2085|'chroma-derived-nc'|'chroma-derived-c'|ictcp).
-export_type([frame_video_pix_fmt/0, frame_video_color_space/0]).

-type(frame_sound_channels() ::mono|stereo).
-type(frame_sound_size() ::bit8|bit16).
-type(frame_sound_rate() ::rate5|rate11|rate22|rate44).
% -type(frame_sound() ::{frame_sound_channels(), frame_sound_size(), frame_sound_rate()}).

-record(video_frame,{
  content        = undefined ::frame_content(),
  dts            = 0.0 ::float(),
  pts            = 0.0 ::float(),
  duration,
  stream_id      = 0         ::non_neg_integer(),
  codec 	       ::frame_codec(),
  flavor         ::frame_flavor(),
  track_id       = 0 ::non_neg_integer(),
  body           = <<>>      ::binary(),
  next_id        = undefined ::any(),
  mpegts         ::binary(),
  source         = undefined :: any(),
  options        = #{}
}).


-record(epg_event, {
  stream_id,
  source,
  id,
  start,
  duration,
  status,
  language,
  name,
  about,
  encrypted,
  rating,
  genre,
  ext
}).

-define(FIRST_JAN_2018, 1514764800).

-define(DTS_IS_US,false).

-define(MIN_SECOND,1000000000).
-define(MAX_SECOND,2000000000).
-define(MIN_MILLI_SECOND, 1000000000000).
-define(MAX_MILLI_SECOND, 2000000000000).
-define(MIN_MICRO_SECOND, 1000000000000000).
-define(MAX_MICRO_SECOND, 2000000000000000).



-if(?DTS_IS_US).
% Микросекунды
-define(TICKS_IN_MS, 1000).
-define(TICKS_WORD, "us").
-define(NOW_TICKS(), minute:now_us()).
-define(KHZ90_TO_TICKS(X), (((X)*1000) div 90)).
-define(TICKS_TO_KHZ90(X), (((X)*90) div 1000)). % *90/1000 = *0.09 = /11
-define(TICKS_TO_MHZ27(X), ((X)*27)).
-define(TICKS_TO_SEC(X), ((X) div 1000000)).
-define(TICKS_TO_MS(X), ((X) div 1000)).
-define(TICKS_TO_US(X), (X)).
-define(SEC_TO_TICKS(X), round((X)*1000000)).
-define(MS_TO_TICKS(X), round((X)*1000)).
-define(US_TO_TICKS(X), (X)).

-define(MIN_TICK, ?MIN_MICRO_SECOND).
-define(MAX_TICK, ?MAX_MICRO_SECOND).

-else.
% Дробные миллисекунды
-define(TICKS_IN_MS, 1).
-define(TICKS_WORD, "ms").
-define(NOW_TICKS(), minute:now_ms()).
-define(KHZ90_TO_TICKS(X), ((X) / 90)).
-define(TICKS_TO_KHZ90(X), round((X)*90)).
-define(TICKS_TO_MHZ27(X), round((X)*27000)).
-define(TICKS_TO_SEC(X), trunc((X)/1000)).
-define(TICKS_TO_MS(X), (X)).
-define(TICKS_TO_US(X), trunc((X)*1000)).
-define(SEC_TO_TICKS(X), ((X)*1000.0)).
-define(MS_TO_TICKS(X), ((X)*1.0)).
-define(US_TO_TICKS(X), ((X)/1000)).

-define(MIN_TICK, (?MIN_MILLI_SECOND)).
-define(MAX_TICK, (?MAX_MILLI_SECOND)).

-endif.


%% -type drm_key() :: {Type::atom(), [{K::atom(),V::any()}]}.


-record(segment,{
  opened_at :: float(), % expected to be in seconds
  dts :: float(),
  number :: non_neg_integer(),
  duration :: float(),
  drm_key,
  body    :: binary(),
  jpeg,
  frog,
  locked = false,
  discontinuity = false,
  skip_storage = false,
  media_info,

  % options = [],
  source :: any(),
  ad :: any()
}).


-record(stream_status, {
  source,
  status
}).



-type(video_frame() :: #video_frame{}).
-type segment() :: #segment{}.
-endif.
