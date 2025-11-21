<?php
header('Content-Type: application/json');
include 'cors.php'; // Включение CORS, если необходимо
require_once 'db.php'; // Подключение к базе данных

try {
    // Получение соединения с базой данных
    $pdo = getDbConnection();

    // Получение данных из запроса
    $data = json_decode(file_get_contents('php://input'), true);

    // Проверка наличия ID и id_usertg
    if (!isset($data['id']) || !isset($data['id_usertg'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        exit;
    }

    $id = $data['id'];
    $id_usertg = $data['id_usertg'];

    // Проверка статуса пользователя
    $stmt = $pdo->prepare('SELECT status FROM users WHERE id_usertg = :id_usertg');
    $stmt->bindParam(':id_usertg', $id_usertg, PDO::PARAM_STR);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || $user['status'] !== 'admin') {
        echo json_encode(['success' => false, 'error' => 'Нет прав администратора']);
        exit;
    }

    // Обновление статуса
    $stmt = $pdo->prepare('UPDATE steps SET status = 2 WHERE id = :id AND status = 1');
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to update status']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
