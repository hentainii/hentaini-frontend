<?php

require '../../vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Request;


$client = new Client();
$headers = [
  'Content-Type' => 'application/x-www-form-urlencoded',
  'Origin' => 'www.mp4upload.com'
];
$options = [
'form_params' => [
  'op' => 'login',
  'login' => 'ddfdfsdfdfdf',
  'password' => 'sebas500'
]];
$request = new Request('POST', 'https://www.mp4upload.com/', $headers);
$res = $client->sendAsync($request, $options)->wait();
echo $res->getHeaderLine('server');
