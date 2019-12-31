-record(dash_manifest, {
  flow_type :: file |stream,
  availability_start_time,
  publish_time,
  video_start_number,
  video_timescale,
  entries = [],
  periods = []
}).
