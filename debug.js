$(function() {

    $('#files').on('change', function(e) {
        $.get(e.target.value, function(data) {
            $('#rules').val(data);
            $('#file').val(e.target.value);
        });
    });

    $.get('config.json', function(data) {
        $.each(data, function(key, value) {
            $('#files').append($('<option>', {
                value: value
            }).text(key));
        });
        $('#files').trigger('change');
    },'json');

    $.post('debug.php', {
        'action': 'myIpAddress'
    }, function(data) {
        $('#client').val(data);
    }, 'json');

    $.validator.addMethod("ipv4", function(value, element) {
        return this.optional(element) || /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i.test(value);
    }, "Please enter a valid IP v4 address.");

    $.validator.addMethod("time", function(value, element) {
        return this.optional(element) || /^([01]\d|2[0-3]|[0-9])(:[0-5]\d){1,2}$/.test(value);
    }, "Please enter a valid time, between 00:00 and 23:59");

    $('#pac').validate({
        debug: true,
        rules: {
            rules: "required",
            url: {
                required: true,
                url: true
            },
            client: {
                required: true,
                ipv4: true
            },
            date: {
                required: true,
                dateISO: true
            },
            time: {
                required: true,
                time: true
            }
        },
    });

    $('#date').val(moment().format("YYYY-MM-DD"));
    $('#time').val(moment().format("HH:mm"));

    $('#pac').on('submit', function(event) {
        event.preventDefault();
        if ($('#pac').valid()) {
            try {
                var datetime = moment($('#time').val(), 'HH:mm:ss')
                datetime = moment($('#date').val()).set({
                    hours: datetime.hours(),
                    minutes: datetime.minutes(),
                    seconds: datetime.seconds()
                });

                $('#rule').val(new Pac($('#client').val(), datetime).evaluate($('#rules').val(), $('#url').val() ))
            } catch (error) {
                $('#rule').val(error)
            }
        };
    });

});