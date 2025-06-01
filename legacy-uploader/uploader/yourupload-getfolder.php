<?php
require '../../vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Request;

header("Access-Control-Allow-Origin: https://animemanito.tv");
header("Access-Control-Allow-Methods: POST");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $email = $_POST['email'];
  $password = $_POST['password'];

  $client = new Client();
  $headers = [
    'Content-Type' => 'application/x-www-form-urlencoded',
    'Origin' => 'www.yourupload.com'
  ];
  $options = [
    'form_params' => [
      'email' => $email,
      'password' => $password
    ]
  ];

  $request = new Request('POST', 'https://www.yourupload.com/login', $headers);
  $res = $client->sendAsync($request, $options)->wait();

  $cookie = $res->getHeaderLine('set-cookie');

  $headers2 = [
    'Content-Type' => 'application/x-www-form-urlencoded',
    'Cookie' => explode(";", $cookie)[0]
  ];

  $options = [
    'form_params' => [
      'email' => $email,
      'password' => $password
    ]
  ];

  $request2 = new Request('POST', 'https://www.yourupload.com/login', $headers2);
  $res2 = $client->sendAsync($request2, $options)->wait();
    
  $html = (string) $res2->getBody();

  $dom = new DOMDocument();
  libxml_use_internal_errors(true);
  $dom->loadHTML($html);
  libxml_clear_errors();

  $element = $dom->getElementById('parentFolderId');
  if ($element) {
      $dataValue = $element->getAttribute('data-value');
      $res = [
        "folder" => $dataValue,
        "cookie" => explode(";", $cookie)[0]
      ];
      echo json_encode($res);
  } else {
      echo 'Element with ID "parentFolderId" not found.';
  }
}
?>