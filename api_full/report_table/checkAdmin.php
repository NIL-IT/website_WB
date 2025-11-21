<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['id_usertg'])) {
    echo json_encode(['success' => false, 'error' => 'Нет id пользователя']);
    exit;
}

$id_usertg = $data['id_usertg'];

try {
    $pdo = getDbConnection();
    $stmt = $pdo->prepare('SELECT status FROM users WHERE id_usertg = :id_usertg');
    $stmt->bindParam(':id_usertg', $id_usertg, PDO::PARAM_STR);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && $user['status'] === 'admin') {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Нет прав администратора']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Ошибка БД: ' . $e->getMessage()]);
}
?>
