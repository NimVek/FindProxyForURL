// Example for converting Windows proxy config into pac-file
function FindProxyForURL(url, host) {

    // Exceptions
    var exceptions = ['*.direct.com', 'direct.company.com'];
    for (var i = 0; i < exceptions.length; i++) {
        if (shExpMatch(host, exceptions[i])) return "DIRECT";
    }

    // Option: Bypass proxy server for local addresses
    if (isPlainHostName(host)) return "DIRECT";

    // Proxy
    return "PROXY proxy.example.com:8080";

}
