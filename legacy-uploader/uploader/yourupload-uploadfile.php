<?php
require '../../vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Utils;

header("Access-Control-Allow-Origin: https://animemanito.tv");
header("Access-Control-Allow-Methods: POST");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Invalid request method']);
    exit;
}

// Validar los parámetros necesarios
if (!isset($_POST['file_name'], $_POST['chunk_number'], $_POST['total_chunks'], $_POST['cookie'], $_POST['folder'])) {
    echo json_encode(['error' => 'Missing parameters']);
    exit;
}

$fileName = $_POST['file_name'];
$chunkNumber = $_POST['chunk_number'];
$totalChunks = $_POST['total_chunks'];
$cookie = $_POST['cookie'];
$folder = $_POST['folder'];

// Verificar el fragmento
if (!isset($_FILES['chunk']) || $_FILES['chunk']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['error' => 'No chunk uploaded or upload error']);
    exit;
}

// Configurar la carpeta temporal para almacenar fragmentos
$tempDir = sys_get_temp_dir() . "/uploads-yp/" . md5($fileName);
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

    // Subir el archivo ensamblado a YourUpload
    try {
        $client = new Client();
        $headers = [
            'Cookie' => $cookie
        ];
        $options = [
            'multipart' => [
                [
                    'name' => '',
                    'contents' => Utils::tryFopen($finalPath, 'r'),
                    'filename' => $fileName
                ]
            ]
        ];

        $request = new Request('POST', 'https://io.yourupload.com/upload?folder=' . $folder, $headers);
        $response = $client->sendAsync($request, $options)->wait();

        // Limpiar carpeta temporal
        unlink($finalPath);
        rmdir($tempDir);

        $res = $response->getBody()->getContents();
        $resArray = json_decode($res, true);
        file_put_contents('test.txt', print_r($resArray, true));
        $fileCode = $resArray["files"][""]["doc"]["jobHandle"];
        echo json_encode(['success' => true, 'file_code' => $fileCode]);
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => true, 'message' => 'Chunk uploaded successfully']);
}
?>
