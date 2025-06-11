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
    $data = json_decode(file_get_contents('php://input'), true);

    $id_usertg = $data['id_usertg'] ?? null;
    if (!$id_usertg || !isAdmin($id_usertg, $pdo)) {
        echo json_encode(['status' => false, 'message' => 'Нет доступа']);
        exit;
    }

    $manager_username = $data['manager_username'] ?? '';
    $admin_username = $data['admin_username'] ?? '';
    $path_reciept_img = $data['path_reciept_img'] ?? '';
    $amount = $data['amount'] ?? 0;

    // Пример вставки (реализуйте свою логику)
    $stmt = $pdo->prepare("INSERT INTO payments (manager_username, admin_username, path_reciept_img, amount, created_at) VALUES (?, ?, ?, ?, NOW())");
    $stmt->execute([$manager_username, $admin_username, $path_reciept_img, $amount]);

    echo json_encode(['status' => true]);
} catch (Exception $e) {
    echo json_encode(['status' => false, 'message' => $e->getMessage()]);
}
?>
