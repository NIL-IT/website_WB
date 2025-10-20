<?php
header('Content-Type: application/json');
include 'cors.php';
require 'db.php';

// Получение данных из POST запроса
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input: id or username is missing']);
    exit;
}

$id = $data['id'];
$username = $data['username'] ?? null; // username может быть не передан

try {
    $conn = getDbConnection();

    // Проверка существования пользователя по id_usertg
    $stmt = $conn->prepare("SELECT * FROM users WHERE id_usertg = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Проверка корректности и обновление username
        if ($username !== null && $username !== '' && $username !== 'undefined') {
            if ($user['username'] !== $username) {
                // Обновление username
                $updateStmt = $conn->prepare("UPDATE users SET username = :username WHERE id_usertg = :id");
                $updateStmt->bindParam(':username', $username, PDO::PARAM_STR);
                $updateStmt->bindParam(':id', $id, PDO::PARAM_INT);
                $updateStmt->execute();
                $user['username'] = $username;
            }
        }

        // Получение статуса пользователя
        $status = $user['status'];

        // Получение поля confirmation (если есть) с безопасным значением по умолчанию
        $confirmation = isset($user['confirmation']) ? $user['confirmation'] : false;

        // Определение, является ли username валидным
        $validUsername = ($user['username'] !== null && $user['username'] !== '' && $user['username'] !== 'undefined');

        // Оставляем только нужные поля, добавляем confirmation
        $user = [
            'id_usertg' => $user['id_usertg'],
            'username' => $user['username'],
            'status' => $user['status'],
            'confirmation' => $confirmation
        ];

        echo json_encode(["success" => true, "data" => $user, "validUsername" => $validUsername]);
    } else {
        echo json_encode(["success" => false, "message" => "User not found"]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Query failed: " . $e->getMessage()]);
}
?>