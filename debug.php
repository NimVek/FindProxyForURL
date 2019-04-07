<?php

switch ($_REQUEST['action']) {
    case "myIpAddress":
        $response = $_SERVER['HTTP_CLIENT_IP'] ? : ($_SERVER['HTTP_X_FORWARDED_FOR'] ? : $_SERVER['REMOTE_ADDR']);
        break;

    case "dnsResolve":
        $host = $_REQUEST['host'];
        if (isset($host)) {
            $response = gethostbyname($host);
            if ($response == $host) {
                $response = NULL;
            }
        } else {
            $error = "Invalid host";
        }
        break;

    default:
        $error = "Invalid action";
}

if (isset($error)) {
    http_response_code(406);
    $response = $error;
}

header('Content-type: application/json');
echo json_encode($response);

?>
