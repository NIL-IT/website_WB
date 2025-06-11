<?php
require_once '../website_WB/api_full/db.php';
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
        echo json_encode(['status' => false, 'message' => 'Нет доступа']);
        exit;
    }

    // Пример сброса рейтинга
    $pdo->exec("UPDATE user_ratings SET score = 0, invited = 0, top = 0");

    echo json_encode(['status' => true]);
} catch (Exception $e) {
    echo json_encode(['status' => false, 'message' => $e->getMessage()]);
}
?>
