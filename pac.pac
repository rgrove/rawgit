function FindProxyForURL(url, host) {
    // 代理服务器的 IP 地址和端口号
    var proxyIP = "192.168.87.34";
    var proxyPort = 3128;

    // 需要使用代理的网站列表
    var proxySites = [
        "www.bilibili.com",
        "*.baidu.com"
    ];

    // 检查网站是否需要使用代理
    for (var i = 0; i < proxySites.length; i++) {
        var site = proxySites[i];

        // 如果使用通配符，则使用 shExpMatch 进行匹配
        if (site.indexOf('*') !== -1) {
            if (shExpMatch(host, site)) {
                // 返回代理地址和端口
                return "PROXY " + proxyIP + ":" + proxyPort;
            }
        } else {
            // 否则，使用 dnsDomainIs 进行匹配
            if (dnsDomainIs(host, site)) {
                // 返回代理地址和端口
                return "PROXY " + proxyIP + ":" + proxyPort;
            }
        }
    }

    // 默认情况下，直接连接
    return "DIRECT";
}
