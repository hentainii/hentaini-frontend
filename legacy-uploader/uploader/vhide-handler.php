<?php

require '../../vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Cookie\CookieJar;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Psr7\Utils;

header("Access-Control-Allow-Origin: https://animemanito.tv");
header("Access-Control-Allow-Methods: POST");
header('Content-Type: application/json');

class VHideUploadAPI {
    private $apiKey;
    private $client;
    private $cookieJar;

    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
        $this->cookieJar = new CookieJar();
        $this->client = new Client(['cookies' => $this->cookieJar]);
    }

    public function getUploadServer() {
        try {
            $response = $this->client->get('https://vidhideapi.com/api/upload/server', [
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
        $uploadServer = $this->getUploadServer();
        file_put_contents('vhide_fp.txt', print_r($filePath, true));

        try {
            $response = $this->client->post($uploadServer, [
                'multipart' => [
                    [
                        'name'     => 'key',
                        'contents' => $this->apiKey
                    ],
                    [
                        'name'     => 'file',
                        'contents' => Utils::tryFopen($filePath, 'r'),
                        'filename' => $fileName
                    ]
                ]
            ]);

            $data = json_decode($response->getBody(), true);
            
            if ($data['status'] == 200) {
                return $data['files'][0]['filecode'];
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
if (!isset($_POST['api_key'], $_POST['file_name'], $_POST['chunk_number'], $_POST['total_chunks'])) {
    echo json_encode(['error' => 'Missing parameters']);
    exit;
}

$apiKey = $_POST['api_key'];
$fileName = $_POST['file_name'];
$chunkNumber = $_POST['chunk_number'];
$totalChunks = $_POST['total_chunks'];

// Verificar el fragmento
if (!isset($_FILES['chunk']) || $_FILES['chunk']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['error' => 'No chunk uploaded or upload error']);
    exit;
}

// Configurar la carpeta temporal para almacenar fragmentos
$tempDir = sys_get_temp_dir() . "/uploads-vhide/" . md5($fileName);
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

    // Subir el archivo ensamblado usando VHideUploadAPI
    try {
        $api = new VHideUploadAPI($apiKey);
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
