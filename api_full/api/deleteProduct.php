<?php
header('Content-Type: application/json');
include 'cors.php';
include 'db.php'; 

$data = json_decode(file_get_contents('php://input'), true);
$productId = $data['productId'];
$id_usertg = $data['userId'];

// Получение информации о пользователе
$pdo = getDbConnection();
$userQuery = $pdo->prepare("SELECT * FROM users WHERE id_usertg = :id_usertg");
$userQuery->execute(['id_usertg' => $id_usertg]);
$user = $userQuery->fetch();

if (!$user) {
    echo json_encode(['success' => false, 'error' => 'Пользователь не найден']);
    exit;
}

if ($user['status'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'У вас нет прав для изменения этого товара']);
    exit;
}

// Начало транзакции
$pdo->beginTransaction();

try {
    // Обновление полей expire и available_day в таблице products
    $updateProductQuery = $pdo->prepare("UPDATE products SET expire = true, available_day = '{}' WHERE id = :productId");
    $updateProductQuery->execute(['productId' => $productId]);

    // Проверка, было ли обновление успешным
    if ($updateProductQuery->rowCount() > 0) {
        // Завершение транзакции
        $pdo->commit();
        echo json_encode(['success' => true]);
    } else {
        // Откат транзакции в случае неудачного обновления
        $pdo->rollBack();
        echo json_encode(['success' => false, 'error' => 'Ошибка при обновлении товара']);
    }
} catch (Exception $e) {
    // Откат транзакции в случае ошибки
    $pdo->rollBack();
    echo json_encode(['success' => false, 'error' => 'Ошибка при выполнении операции: ' . $e->getMessage()]);
}
?>