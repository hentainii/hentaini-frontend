<?php

require '../../vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Cookie\CookieJar;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Psr7\Utils;

header("Access-Control-Allow-Origin: https://animemanito.tv");
header("Access-Control-Allow-Methods: POST");
header('Content-Type: application/json');

class MP4UploadAPI {
    private $apiKey;
    private $client;
    private $username;
    private $password;
    private $cookieJar;

    public function __construct($apiKey, $username, $password) {
        $this->apiKey = $apiKey;
        $this->username = $username;
        $this->password = $password;
        $this->cookieJar = new CookieJar();
        $this->client = new Client(['cookies' => $this->cookieJar]);
    }

    private function authenticate() {
        $options = [
            'form_params' => [
                'op' => 'login',
                'login' => $this->username,
                'password' => $this->password
            ]
        ];

        try {
            $response = $this->client->post('https://www.mp4upload.com/', $options);
            
            $xfssCookie = $this->cookieJar->getCookieByName('xfss');
            if (!$xfssCookie) {
                throw new Exception("Failed to obtain session cookie");
            }
            
            return $xfssCookie->getValue();
        } catch (GuzzleException $e) {
            throw new Exception("Authentication failed: " . $e->getMessage());
        }
    }

    public function getUploadServer() {
        try {
            $response = $this->client->get('https://www.mp4upload.com/api/upload/server', [
                'query' => ['key' => $this->apiKey]
            ]);

            $data = json_decode($response->getBody(), true);
            
            if ($data['status'] == 200 && isset($data['result'])) {
                return $data['result'];
            } else {
                throw new Exception("Failed to get upload server: " . $data['msg']);
            }
        } catch (GuzzleException $e) {
            throw new Exception("Error getting upload server: " . $e->getMessage());
        }
    }

    public function uploadFile($filePath, $fileName) {
        $sessionId = $this->authenticate();
        $uploadServer = $this->getUploadServer();

        try {
            $response = $this->client->post($uploadServer, [
                'multipart' => [
                    [
                        'name'     => 'sess_id',
                        'contents' => $sessionId
                    ],
                    [
                        'name'     => 'file',
                        'contents' => Utils::tryFopen($filePath, 'r'),
                        'filename' => $fileName
                    ]
                ]
            ]);

            $data = json_decode($response->getBody(), true);
            
            if (isset($data[0]['file_code'])) {
                return $data[0]['file_code'];
            } elseif (isset($data['file_code'])) {
                return $data['file_code'];
            } else {
                throw new Exception("Failed to upload file: " . json_encode($data));
            }
        } catch (GuzzleException $e) {
            throw new Exception("Error uploading file: " . $e->getMessage());
        }
    }
}

// Verificar si la solicitud es POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Invalid request method']);
    exit;
}

// Validar parámetros necesarios
if (!isset($_POST['api_key'], $_POST['username'], $_POST['password'], $_POST['file_name'], $_POST['chunk_number'], $_POST['total_chunks'])) {
    echo json_encode(['error' => 'Missing parameters']);
    exit;
}

$apiKey = $_POST['api_key'];
$username = $_POST['username'];
$password = $_POST['password'];
$fileName = $_POST['file_name'];
$chunkNumber = $_POST['chunk_number'];
$totalChunks = $_POST['total_chunks'];

// Verificar el fragmento
if (!isset($_FILES['chunk']) || $_FILES['chunk']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['error' => 'No chunk uploaded or upload error']);
    exit;
}

// Configurar la carpeta temporal para almacenar fragmentos
$tempDir = sys_get_temp_dir() . "/uploads-mp4/" . md5($fileName);
if (!file_exists($tempDir)) {
    mkdir($tempDir, 0777, true);
}

// Guardar el fragmento
$chunkPath = $tempDir . "/chunk_" . $chunkNumber;
move_uploaded_file($_FILES['chunk']['tmp_name'], $chunkPath);

// Si este es el último fragmento, ensamblar el archivo y subirlo
if ($chunkNumber + 1 == $totalChunks) {
    $finalPath = $tempDir . "/" . basename($fileName); // Ruta para ensamblar el archivo final
    $outputFile = fopen($finalPath, 'wb');

    for ($i = 0; $i < $totalChunks; $i++) {
        $chunkFile = $tempDir . "/chunk_" . $i;
        $chunkData = file_get_contents($chunkFile);
        fwrite($outputFile, $chunkData);
        unlink($chunkFile); // Eliminar fragmento después de ensamblarlo
    }

    fclose($outputFile);

    // Subir el archivo ensamblado usando MP4UploadAPI
    try {
        $api = new MP4UploadAPI($apiKey, $username, $password);
        $fileCode = $api->uploadFile($finalPath, $fileName);

        // Limpiar carpeta temporal
        unlink($finalPath);
        rmdir($tempDir);

        echo json_encode(['success' => true, 'file_code' => $fileCode]);
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => true, 'message' => 'Chunk uploaded successfully']);
}
?>
