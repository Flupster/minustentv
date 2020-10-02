# NGINX Config Example

```NGINX
server {
    listen [::]:80 http2;
    listen 80 http2;
    server_name minusten.tv;
    access_log /var/log/nginx/minusten.tv.access_log;
    error_log /var/log/nginx/minusten.tv.error_log;
    client_max_body_size 10G;
    proxy_request_buffering off;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $http_connection;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_pass http://127.0.0.1:5000/;
    }
}
```

Remember to have letsencrypt auto generate the config if you wish to use SSL
