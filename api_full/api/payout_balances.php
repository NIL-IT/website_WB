<?php
require_once '../website_WB/api_full/db.php';
header('Content-Type: application/json');

// Проверка на админа (примерная реализация)
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

    // Получение балансов менеджеров
    $stmt = $pdo->query("SELECT manager_username, amount, request FROM payout_balances");
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'ok', 'data' => $result]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
