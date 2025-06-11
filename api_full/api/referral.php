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

    $stmt = $pdo->prepare("SELECT referral_id FROM users WHERE id_usertg = ?");
    $stmt->execute([$useridTG]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'ok', 'referral_id' => $row['referral_id'] ?? null]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
