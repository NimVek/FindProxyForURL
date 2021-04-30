<?php

switch ($_REQUEST['action'] ?? "invalid") {
    case "myIpAddress":
        $response = $_SERVER['HTTP_CLIENT_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];
        $response = explode(",", $response)[0];
        break;

    case "dnsResolve":
        if (isset($_REQUEST['host'])) {
            $response = gethostbyname($_REQUEST['host']);
            if ($response == $_REQUEST['host']) {
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
