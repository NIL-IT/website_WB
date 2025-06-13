<?php
require_once 'db.php';
require_once 'cors.php';
header('Content-Type: application/json');

// Проверка на админа по id_usertg
function isAdmin($id_usertg, $pdo) {
    $stmt = $pdo->prepare("SELECT status FROM users WHERE id_usertg = ?");
    $stmt->execute([$id_usertg]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row && $row['status'] === 'admin';
}

try {
    $pdo = getDbConnection();
    $data = json_decode(file_get_contents('php://input'), true);

    $id_usertg = $data['id_usertg'] ?? null;
    $manager_id = $data['manager_id'] ?? null;
    $path_reciept_img = $data['path_reciept_img'] ?? '';
    $amount = $data['amount'] ?? 0;

    if (!$id_usertg || !isAdmin($id_usertg, $pdo)) {
        echo json_encode(['success' => false, 'message' => 'Нет доступа']);
        exit;
    }

    if (!$manager_id || !$amount) {
        echo json_encode(['success' => false, 'message' => 'manager_id и amount обязательны']);
        exit;
    }

    // Проверка на отрицательное значение amount и на 0
    if ($amount <= 0) {
        echo json_encode(['success' => false, 'message' => 'amount должен быть больше 0']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO payouts (manager_id, path_reciept_img, amount, paid_by) VALUES (?, ?, ?, ?)");
    $stmt->execute([$manager_id, $path_reciept_img, $amount, $id_usertg]);

    // Поиск manager_id в таблице managers и обновление balance
    $stmt = $pdo->prepare("SELECT balance FROM managers WHERE id = ?");
    $stmt->execute([$manager_id]);
    $manager = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($manager) {
        $new_balance = $manager['balance'] + $amount;
        $stmt = $pdo->prepare("UPDATE managers SET balance = ? WHERE id = ?");
        $stmt->execute([$new_balance, $manager_id]);
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
