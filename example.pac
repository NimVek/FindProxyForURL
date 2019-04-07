function FindProxyForURL(url, host) {
    if (isResolvable(host)) return "DIRECT";

    return "PROXY proxy.example.com:8080; DIRECT";
}
