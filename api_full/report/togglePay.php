<?php
header('Content-Type: application/json');
include 'cors.php'; // Включение CORS, если необходимо
require_once 'db.php'; // Подключение к базе данных

try {
    // Получение соединения с базой данных
    $pdo = getDbConnection();

    // Получение данных из запроса
    $data = json_decode(file_get_contents('php://input'), true);

    // Проверка наличия необходимых данных
    if (!isset($data['id'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        exit;
    }

    $id = $data['id'];

    // Получение текущего значения paid из таблицы steps
    $stmt = $pdo->prepare('SELECT paid FROM steps WHERE id = :id');
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $currentPaid = $stmt->fetchColumn();

    // Инвертирование значения paid
    $newPaid = !$currentPaid;

    // Обновление значения paid в таблице steps
    $updateStmt = $pdo->prepare('UPDATE steps SET paid = :paid WHERE id = :id');
    $updateStmt->bindParam(':paid', $newPaid, PDO::PARAM_BOOL);
    $updateStmt->bindParam(':id', $id, PDO::PARAM_INT);
    $updateStmt->execute();

    echo json_encode(['success' => true, 'paid' => $newPaid]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>