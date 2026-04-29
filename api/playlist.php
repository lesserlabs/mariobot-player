<?php
/**
 * Playlist API Endpoint
 * Receives POST requests with playlist JSON and writes it to /playlist.json
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Read POST data
$playlist_json = file_get_contents('php://input');
$data = json_decode($playlist_json, true);

// Validate
if (!$data || !isset($data['playlist']) || !is_array($data['playlist'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid playlist format. Must include "playlist" array.']);
    exit;
}

// Write to file
$playlist_file = __DIR__ . '/../playlist.json';
file_put_contents($playlist_file, json_encode($data, JSON_PRETTY_PRINT));

echo json_encode([
    'status' => 'success',
    'message' => 'Playlist updated',
    'tracks' => count($data['playlist']),
    'name' => $data['name'] ?? 'Unknown',
    'theme' => $data['theme'] ?? 'Unknown'
]);
?>
