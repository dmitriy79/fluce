-record(hls_key, {
  key :: binary(),
  iv :: binary(),
  method :: aes128|sample_aes,
  url :: binary(),
  keyformat :: binary(),
  keyformatversions :: binary() | undefined
}).


-record(dash_key, {
  key :: binary(),
  key_id :: binary(),
  widevine :: binary(),
  playready :: binary()
}).


-record(drm_key, {
  hls :: #hls_key{} | undefined,
  dash :: #dash_key{} | undefined,
  encryption = sparse :: full | sparse  
}).


-record(drm_config, {
  type,
  vendor,
  resource_id,
  spec,
  expires,
  encryption = sparse :: full | sparse   % encrypt all video frames or only keyframes
}).

-define(PLAYREADY_UUID, <<"9a04f079-9840-4286-ab92-e65be0885f95">>).
-define(WIDEVINE_UUID, <<"edef8ba9-79d6-4ace-a3c8-27dcd51d21ed">>).
-define(FAIRPLAY_UUID, <<"94ce86fb-07ff-4f43-adb8-93d2fa968ca2">>).

-define(PLAYREADY_ID, <<154,4,240,121,152,64,66,134,171,146,230,91,224,136,95,149>>).
-define(WIDEVINE_ID,  <<237,239,139,169,121,214,74,206,163,200,39,220,213,29,33,237>>).
-define(FAIRPLAY_ID,  <<148,206,134,251,7,255,79,67,173,184,147,210,250,150,140,162>>).
