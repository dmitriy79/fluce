-record(frame_id, {
  id,
  tracks = []
}).

-record(mp4_media, {
  file,
  file_type,
  timescale,
  duration = 0,
  file_types = [],
  tracks = [],
  index,
  width,
  height,
  frames,
  additional = [],
  reader,
  data_borders,
  disk_read = true,
  segment_duration,
  options
}).

-record(mp4_track, {
  codec,
  title,
  content,
  track_id,
  timescale,
  duration = 0,
  width,
  height,
  decoder_config,
  max_bitrate,
  bitrate,
  language,
  frames,
  segment_duration,
  number,
  sample_count,
  total_bytes,
  index_info = [],
  sample_sizes = [],
  first_dts_offset = 0,
  sample_dts = [],
  sample_offsets = [],
  sample_composition = [],
  keyframes = [],
  raw_keyframes = [],
  chunk_offsets = [],
  offset_size = 4,
  chunk_sizes = [],
  elst
}).

-type mp4_frame_id() :: integer().

-record(mp4_frame, {
  id :: mp4_frame_id(),
  track_id,
  dts,
  size,
  pts,
  keyframe = false,
  offset,
  codec,
  content,
  body,
  next_id
}).

-record(mp4_sample_description, {

}).

-record(esds, {
  object_type,
  stream_type,
  upstream,
  buffer_size,
  max_bitrate,
  avg_bitrate,
  specific
}).


-type mp4_media() :: #mp4_media{}.


