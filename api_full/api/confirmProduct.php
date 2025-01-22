<?php
header('Content-Type: application/json');
include 'cors.php';
include 'db.php'; 

$data = json_decode(file_get_contents('php://input'), true);
$productId = $data['productId'];
$id_usertg = $data['userId'];

$pdo = getDbConnection();
$userQuery = $pdo->prepare("SELECT * FROM users WHERE id_usertg = :id_usertg");
$userQuery->execute(['id_usertg' => $id_usertg]);
$user = $userQuery->fetch();

if (!$user) {
    echo json_encode(['success' => false, 'error' => 'Пользователь не найден']);
    exit;
}

if ($user['status'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'У вас нет прав для подтверждения этого товара']);
    exit;
}

try {
    // Обновление статуса подтверждения товара
    $productQuery = $pdo->prepare("UPDATE products SET is_confirmed = TRUE WHERE id = :productId AND is_confirmed = FALSE");
    $productQuery->execute(['productId' => $productId]);

    // Проверка, было ли обновление успешным
    if ($productQuery->rowCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Ошибка при подтверждении товара или товар уже подтвержден']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Ошибка при выполнении операции']);
}
?>