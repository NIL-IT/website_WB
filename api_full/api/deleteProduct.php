<?php
header('Content-Type: application/json');
include 'cors.php';
include 'db.php'; 

$data = json_decode(file_get_contents('php://input'), true);
$productId = $data['productId'];
$id_usertg = $data['userId'];

// Получение информации о пользователе
$pdo= getDbConnection();
$userQuery = $pdo->prepare("SELECT * FROM users WHERE id_usertg = :id_usertg");
$userQuery->execute(['id_usertg' => $id_usertg]);
$user = $userQuery->fetch();

if (!$user) {
    echo json_encode(['success' => false, 'error' => 'Пользователь не найден']);
    exit;
}

if ($user['status'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'У вас нет прав для удаления этого товара']);
    exit;
}

// Удаление товара
$productQuery = $pdo->prepare("DELETE FROM products WHERE id = :productId");
$productQuery->execute(['productId' => $productId]);

if ($productQuery->rowCount() > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Ошибка при удалении товара']);
}
?>