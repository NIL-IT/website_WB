<?php
header('Content-Type: application/json');
include 'cors.php';
require_once 'db.php';

try {
    // Получение соединения с базой данных
    $pdo = getDbConnection();

    // Получение данных из запроса
    $data = json_decode(file_get_contents('php://input'), true);

    // Проверка наличия необходимых данных
    if (!isset($data['id_usertg'], $data['id_product'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        exit;
    }

    $id_usertg = $data['id_usertg'];
    $id_product = $data['id_product'];

    // Вставка данных в таблицу steps
    $stmt = $pdo->prepare('INSERT INTO steps (step, id_usertg, id_product, verified, paid) VALUES (0, :id_usertg, :id_product, false, false)');
    $stmt->bindParam(':id_usertg', $id_usertg, PDO::PARAM_INT);
    $stmt->bindParam(':id_product', $id_product, PDO::PARAM_INT);

    if ($stmt->execute()) {
        // Получение ID последней вставленной записи
        $stepsId = $pdo->lastInsertId();
        echo json_encode(['success' => true, 'message' => 'Step created successfully', 'stepsId' => $stepsId]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to create step']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
