<?php
header('Content-Type: application/json');
include 'cors.php';
require 'db.php';

$id = $_GET['id'];
$username = $_GET['username'];

try {
    $conn = getDbConnection();

    // Проверка существования пользователя по id_userTG
    $stmt = $conn->prepare("SELECT * FROM users WHERE id_userTG = :id");
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Проверка корректности и обновление username
        if ($username !== null && $username !== '' && $username !== 'undefined') {
            if ($user['username'] !== $username) {
                // Обновление username
                $updateStmt = $conn->prepare("UPDATE users SET username = :username WHERE id_userTG = :id");
                $updateStmt->bindParam(':username', $username);
                $updateStmt->bindParam(':id', $id);
                $updateStmt->execute();
                $user['username'] = $username;
            }
        }

        // Определение, является ли username валидным
        $validUsername = ($user['username'] !== null && $user['username'] !== '' && $user['username'] !== 'undefined');

        echo json_encode(["success" => true, "data" => $user, "validUsername" => $validUsername]);
    } else {
        echo json_encode(["success" => false, "message" => "User not found"]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Query failed: " . $e->getMessage()]);
}
?>