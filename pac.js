var Pac = function(ip, datetime) {
    this.ip = ip;
    this.date = datetime;
}

Pac.prototype.isPlainHostName = function(host) {
    return host.indexOf('.') == -1;
}

Pac.prototype.dnsDomainIs = function(host, domain) {
    return domain.startsWith('.') && host.endsWith(domain);
}

Pac.prototype.localHostOrDomainIs = function(host, hostdom) {
    return (host == hostdom) ||
        hostdom.startsWith(host + '.');
}

Pac.prototype.isResolvable = function(host) {
    return this.dnsResolve(host) != null;
}

var ipv4 = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i;

Pac.prototype.isInNet = function(host, network, mask) {
    function convert(ip) {
        var result = 0;
        $.each(ip.split('.'), function(index, value) {
            result = result << 8 | (value & 0xff);
        });
        return result;
    }

    if (!ipv4.test(network) || !ipv4.test(mask)) {
        return false;
    }
    if (!ipv4.test(host)) {
        host = this.dnsResolve(host);
        if (host == null) {
            return false;
        }
    }
    host = convert(host);
    network = convert(network);
    mask = convert(mask);
    return (host & mask) == (network & mask);
}

Pac.prototype.dnsResolve = function(host) {
    result = null;
    $.ajax({
        url: 'debug.php',
        data: {
            action: 'dnsResolve',
            host: host
        },
        dataType: 'json',
        async: false,
    }).done(function(data) {
        if ($.type(data) === 'string' && ipv4.test(data)) {
            result = data;
        }
    })
    return result;
}

Pac.prototype.myIpAddress = function() {
    return this.ip;
}

Pac.prototype.dnsDomainLevels = function(host) {
    return host.split('.').length - 1;
}

Pac.prototype.shExpMatch = function(url, pattern) {
    pattern = pattern.replace(/\./g, '\\.');
    pattern = pattern.replace(/\*/g, '.*');
    pattern = pattern.replace(/\?/g, '.');
    var re = new RegExp('^' + pattern + '$');
    return re.test(url);
}

Pac.prototype.weekdayRange = function() {
    var now = this.date;
    var argc = arguments.length;

    if (arguments[argc - 1] == 'GMT') {
        argc--;
        now = now.utc();
    }
    if (argc < 1)
        return false;

    var start = moment().day(arguments[0]);
    var end = (argc == 2) ? moment().day(arguments[1]) : start;

    if (start.isValid() && end.isValid()) {
        if (start.day() <= end.day()) {
            return (start.day() <= now.day() && now.day() <= end.day());
        } else {
            return (end.day() >= now.day() || now.day() >= start.day());
        }
    }
    return false;
}

Pac.prototype.dateRange = function() {
    function type(item) {
        if ($.type(item) === 'number') {
            if (item < 32) {
                return 'date';
            } else {
                return 'year';
            }
        } else {
            return 'month';
        }
    }

    function convert(items) {
        var result = {};
        $.each(items, function(index, value) {
            result[type(value)] = value;
        });
        return result;
    }

    var now = this.date;
    var argc = arguments.length;

    if (arguments[argc - 1] == 'GMT') {
        argc--;
        now = now.utc();
    }
    if (argc < 1)
        return false;

    var start = now.clone().startOf('year');
    var end = now.clone().endOf('year');

    if (argc <= 3 && (argc % 2 || type(arguments[0]) == type(arguments[1]))) {
        var tmp = convert(arguments.slice(0, argc));
        start.set(tmp);
        end.set(tmp);
    } else if (argc <= 6 && argc % 2 == 0) {
        start.set(convert(arguments.slice(0, argc >> 1)));
        end.set(convert(arguments.slice(argc >> 1, argc)));
    } else {
        return false;
    }

    if (start.isValid() && end.isValid()) {
        if (start <= end) {
            return start <= now && now <= end;
        } else {
            return end >= now || now >= start;
        }
    }
    return false;
}

Pac.prototype.timeRange = function() {
    var now = this.date;
    var argc = arguments.length;

    if (arguments[argc - 1] == 'GMT') {
        argc--;
        now = now.utc();
    }
    if (argc < 1) {
        return false;
    }

    var start = now.clone().startOf('date');
    var end = now.clone().endOf('date');

    switch (argc) {
        case 1:
            start.hour(arguments[0]);
            end.hour(arguments[0]);
            break;
        case 2:
            start.hour(arguments[0]);
            end.hour(arguments[1]);
            break;
        case 4:
            start.hour(arguments[0]);
            start.minute(arguments[1]);
            end.hour(arguments[2]);
            end.minute(arguments[3]);
            break;
        case 6:
            start.hour(arguments[0]);
            start.minute(arguments[1]);
            start.second(arguments[2]);
            end.hour(arguments[3]);
            end.minute(arguments[4]);
            end.second(arguments[5]);
            break;
        default:
            return false;
    }

    if (start <= end) {
        return start <= now && now <= end;
    } else {
        return end >= now || now >= start;
    }

}

Pac.prototype.alert = function(str) {
    alert(str);
}

Pac.prototype.evaluate = function(code, url) {
    $.each(Object.getOwnPropertyNames(Pac.prototype), function(index, value) {
        code = code.replace(new RegExp('\\b' + value + '\\s*\\(', 'g'), 'this.' + value + '(');
    });

    code = eval('(' + code + ');');

    var host = $('<a>').prop('href', url).prop('hostname');

    return code.call(this, url, host);
}
