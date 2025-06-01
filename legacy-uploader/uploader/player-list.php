<?php
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    require_once('../../app/dbconnection.php');
    // Asumimos que la conexión con MeekroDB ya está configurada en dbconnection.php
    
    try {
        // Consulta SQL para realizar el LEFT JOIN usando MeekroDB
        $results = DB::query("
            SELECT 
                p.id AS player_id, p.name AS player_name, p.url AS player_url, p.type AS player_type, p.up_available AS player_up_available,
                a.id AS account_id, a.service AS account_service, a.email AS account_email, a.password as account_password, a.username, a.api_key
            FROM 
                player p
            LEFT JOIN 
                accounts a ON p.id = a.player_id
            LIMIT 1000
        ");
        
        $players = [];
        
        foreach ($results as $row) {
            $player_id = $row['player_id'];
            
            if (!isset($players[$player_id])) {
                $players[$player_id] = [
                    'id' => $row['player_id'],
                    'name' => $row['player_name'],
                    'url' => $row['player_url'],
                    'type' => $row['player_type'],
                    'up_available' => $row['player_up_available'],
                    'accounts' => []
                ];
            }
            
            if (!is_null($row['account_id'])) {
                $players[$player_id]['accounts'][] = [
                    'id' => $row['account_id'],
                    'service' => $row['account_service'],
                    'email' => $row['account_email'],
                    'password' => $row['account_password'],
                    'username' => $row['username'],
                    'api_key' => $row['api_key']
                ];
            }
        }
        
        $players = array_values($players);
        
        header('Content-Type: application/json');
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Cache-Control: post-check=0, pre-check=0', false);
        header('Pragma: no-cache');
        echo json_encode($players);
        
    } catch (MeekroDBException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database query failed: ' . $e->getMessage()]);
    }
    
    exit;
}
?>