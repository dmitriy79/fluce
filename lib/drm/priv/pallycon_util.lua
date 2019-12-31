--
-- flussonic.conf:
-- web_script pallycon_util apps/drm/priv/pallycon_util.lua site_key="*****" access_key="****" site_id="****";
---


http_handler = {}

http_handler.token = function(req, extra)
  if req.query.timestamp ~= nil then
    timestamp = req.query.timestamp
  else
    timestamp = timestamp()
  end
  params = {
    site_key   = extra.site_key,
    access_key = extra.access_key,
    drm_type   = "Widevine",
    site_id    = extra.site_id,
    user_id    = "LICENSETOKEN",
    cid        = req.query.cid,
    rules      = json.encode({playback_policy = {limit = false}}),
    timestamp  = timestamp
  }
  flussonic.debug("params: "..table.tostring(params))
  return "http", 200, {}, make_token(params)
end


function make_token(params)
  iv = "0123456789abcdef"
  token = base64.encode(crypto.block_encrypt("aes_cbc256", params.site_key, iv, crypto.pkcs_pad(params.rules, 16)))
  data = params.access_key .. params.drm_type .. params.site_id .. params.user_id .. params.cid .. token .. params.timestamp
  hash = base64.encode(crypto.from_hex(crypto.sha256(data)))
  js = {drm_type  = params.drm_type,
        site_id   = params.site_id,
        user_id   = params.user_id,
        cid       = params.cid,
        timestamp = params.timestamp,
        token     = token,
        hash      = hash}
  return base64.encode(json.encode(js))
end


function timestamp()
  time = flussonic.datetime()
  return string.format("%04d-%02d-%02dT%02d:%02d:%02dZ", time.year, time.month, time.day, time.hour, time.minute, time.second)
end

