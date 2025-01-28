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

    // Получение текущего значения verified и status из таблицы steps
    $stmt = $pdo->prepare('SELECT verified, status FROM steps WHERE id = :id');
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $currentVerified = $row['verified'];
    $currentStatus = $row['status'];

    // Инвертирование значения verified
    $newVerified = !$currentVerified;

    // Обновление значения verified и status в таблице steps
    $updateStmt = $pdo->prepare('UPDATE steps SET verified = :verified, status = :status WHERE id = :id');
    $updateStmt->bindParam(':verified', $newVerified, PDO::PARAM_BOOL);
    $newStatus = ($currentStatus == 1) ? 2 : $currentStatus;
    $updateStmt->bindParam(':status', $newStatus, PDO::PARAM_INT);
    $updateStmt->bindParam(':id', $id, PDO::PARAM_INT);
    $updateStmt->execute();

    echo json_encode(['success' => true, 'verified' => $newVerified]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>