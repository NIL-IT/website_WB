<?php
require_once '../api_full/db.php';
header('Content-Type: application/json');

function isAdmin($id_usertg, $pdo) {
    $stmt = $pdo->prepare("SELECT is_admin FROM users WHERE id_usertg = ?");
    $stmt->execute([$id_usertg]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row && $row['is_admin'];
}

try {
    $pdo = getDbConnection();
    $id_usertg = $_GET['id_usertg'] ?? null;
    if (!$id_usertg || !isAdmin($id_usertg, $pdo)) {
        echo json_encode(['status' => 'error', 'message' => 'Нет доступа']);
        exit;
    }

    // Генерация Excel-файла (заглушка)
    $excelUrl = 'https://inhomeka.online:8000/files/payout_history.xlsx';

    echo json_encode(['status' => 'ok', 'url' => $excelUrl]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
