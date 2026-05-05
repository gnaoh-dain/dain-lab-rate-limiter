-- KEYS[1] = key
-- ARGV[1] = now (timestamp ms)
-- ARGV[2] = windowMs
-- ARGV[3] = limit

local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])

local window_start = now - window

-- 1. remove old requests
redis.call("ZREMRANGEBYSCORE", key, 0, window_start)

-- 2. count current requests
local count = redis.call("ZCARD", key)

-- 3. check limit
if count >= limit then
  local oldest = redis.call("ZRANGE", key, 0, 0, "WITHSCORES")
  local oldest_time = tonumber(oldest[2])
  local retry_after = window - (now - oldest_time)
  return {0, count, retry_after}
end

-- 4. add new request
local request_id = now .. "-" .. math.random()
redis.call("ZADD", key, now, request_id)

-- 5. set ttl
redis.call("PEXPIRE", key, window)

return {1, count + 1}
