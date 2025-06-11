<?php
require_once '../website_WB/api_full/db.php';
header('Content-Type: application/json');

try {
    $pdo = getDbConnection();
    $useridTG = $_GET['useridTG'] ?? null;
    if (!$useridTG) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан useridTG']);
        exit;
    }

    // Пример запроса (замените на свою логику)
    $stmt = $pdo->prepare("SELECT score, invited, top FROM user_ratings WHERE id_usertg = ?");
    $stmt->execute([$useridTG]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    $googleTableUrl = 'https://docs.google.com/spreadsheets/d/ВАШ_ID_ТАБЛИЦЫ';

    echo json_encode([
        'status' => 'ok',
        'score' => $row['score'] ?? 0,
        'invited' => $row['invited'] ?? 0,
        'top' => $row['top'] ?? 0,
        'google_table_url' => $googleTableUrl
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
