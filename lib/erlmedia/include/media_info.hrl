%%% codecs
%%% This defines are used to make implementing a new codec easier.

-define(IS_SCTE35_CODEC(C), (C == scte35)).
-define(IS_VIDEO_CODEC(C),  (C == h264 orelse C == hevc orelse C == mp2v)).
-define(IS_AUDIO_CODEC(C),  (C == aac orelse C == mp3 orelse C == mp2a orelse C == ac3 orelse
                             C == eac3 orelse C == pcma orelse C == pcmu orelse C == opus)).
-define(IS_TEXT_CODEC(C),   (C == text orelse C == ttxt orelse C == subtitle orelse C == tx3g)).

-define(IS_AV_CODEC(C),   (?IS_VIDEO_CODEC(C) orelse ?IS_AUDIO_CODEC(C))).
-define(IS_AVT_CODEC(C),  (?IS_VIDEO_CODEC(C) orelse ?IS_AUDIO_CODEC(C) orelse ?IS_TEXT_CODEC(C))).
-define(IS_AVTC_CODEC(C), (?IS_VIDEO_CODEC(C) orelse ?IS_AUDIO_CODEC(C) orelse ?IS_TEXT_CODEC(C) orelse ?IS_SCTE35_CODEC(C))).

-define(IS_MPEGTS_AUDIO_CODEC(C), (?IS_AUDIO_CODEC(C) andalso C =/= pcma andalso C =/= pcmu andalso C =/= opus)).
-define(IS_MPEGTS_TEXT_CODEC(C),  (C == ttxt orelse C == subtitle)).
-define(IS_MPEGTS_AV_CODEC(C),    (?IS_MPEGTS_AUDIO_CODEC(C) orelse ?IS_VIDEO_CODEC(C))).
-define(IS_MPEGTS_AVT_CODEC(C),   (?IS_MPEGTS_AV_CODEC(C) orelse ?IS_MPEGTS_TEXT_CODEC(C))).
-define(IS_MPEGTS_AVTC_CODEC(C),  (?IS_MPEGTS_AVT_CODEC(C) orelse ?IS_SCTE35_CODEC(C))).

-define(IS_HLS_AVT_CODEC(C), (?IS_VIDEO_CODEC(C) orelse ?IS_TEXT_CODEC(C) orelse
    (C == aac orelse C == mp3 orelse C == mp2a orelse C == ac3 orelse C == eac3) orelse
    (C == mpegts))).

-define(IS_MP4_AV_CODEC(C), (C == h264 orelse C == hevc orelse C == aac orelse C == mp3 orelse C == mp2a orelse C == ac3 orelse C == eac3 orelse C == mp2v)).

-define(IS_RTSP_AV_CODEC(C), (C == h264 orelse C == hevc orelse C == aac orelse C == mp3 orelse C == pcma orelse C == pcmu
    orelse C == mpegts orelse C == onvif orelse C == mp2a orelse C == jpeg)).

-define(IS_FLV_VIDEO_CODEC(C), (C == sorenson orelse C == vp6 orelse C == screen)).

%%% end codecs

-type(stream_decoder_config() :: binary()).
-type(stream_video_params() :: {non_neg_integer()}).

-record(video_params, {
  width  = 0 ::non_neg_integer(),
  height = 0 ::non_neg_integer(),
  fps = 0 ::non_neg_integer()
  ,length_size    = 4         ::2|4 % H264 private option
  ,nals           = [] ::any()
  ,pix_fmt = yuv420p   ::video_frame:frame_video_pix_fmt()
  ,color_space = bt709 ::video_frame:frame_video_color_space()
}).

-type(video_params() :: #video_params{}).

-record(audio_params, {
  channels    = 0 ::non_neg_integer(),
  sample_rate = 0 ::non_neg_integer(),
  sample_fmt :: binary(),
  channel_layout :: binary(),
  samples     = 0 ::non_neg_integer(),
  config      = undefined :: any()
}).

-type(audio_params() :: #audio_params{}).

-record(track_info, {
  content        = undefined ::video_frame:frame_content(),
  title          = undefined ::undefined|binary(), % Human readable localized title for HDS/HLS
  track_id       = undefined ::non_neg_integer()|binary(),
  codec          = undefined ::video_frame:frame_codec()|undefined,
  config         = undefined ::stream_decoder_config(),
  bitrate        = undefined ::non_neg_integer(),
  language       = undefined ::binary()|undefined,
  params         = undefined ::audio_params()|video_params(),
  timescale      = 90.0      ::non_neg_integer(), % How many DTS units are in one millisecond. Erlyvideo uses milliseconds everywhere
  frame_duration = undefined,
  orig_track_id  = undefined,
  pid            = undefined,
  drm_key        = undefined, %% XXX Надо убрать, drm_key хранится в media_info
  options        = []        ::[any()]
}).

-type(track_info() :: #track_info{}).

-type(flow_type() :: file|stream).

-record(media_info, {
  flow_type  = undefined ::flow_type(),
  stream_id  = undefined ::any(), % Will be used as ts_stream_id in mpegts
  program_id = undefined, % Will be used as program id
  tracks     = [] :: [track_info()],
  duration   = undefined :: non_neg_integer()|undefined,
  source     = undefined :: any(),
  title      = undefined :: binary(),
  provider   = undefined :: binary(),
  drm_key    = undefined,
  options    = [] :: [any()]
}).

-type media_info() :: #media_info{}.
