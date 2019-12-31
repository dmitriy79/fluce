http_handler = {}

http_handler.auth = function(req)
  headers = {}

  if not req.headers["x-nonce"] then
    headers["x-salt"] = "1234"
    headers["x-nonce"] = "4321"
    return "http", 401, headers, "Auth"
  end
  headers["X-Streampoint-Url"] = "http://127.0.0.1:5243/?streampoint_key=mysecretkey"
  return "http", 200, headers, "Hi"
end

