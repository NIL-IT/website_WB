<?php
require_once 'db.php'; // Подключение к базе данных

// Получение id_usertg из URL
$id_usertg = $_GET['id_usertg'];

// Получение соединения с базой данных
$pdo = getDbConnection();

// Проверка текущего статуса пользователя
$sql = "SELECT status FROM users WHERE id_usertg = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$id_usertg]);
$result = $stmt->fetch(PDO::FETCH_ASSOC);

if ($result) {
    $current_status = $result['status'];

    // Определение нового статуса
    $new_status = ($current_status == "admin") ? "user" : "admin";

    // Обновление статуса пользователя
    $update_sql = "UPDATE users SET status = ? WHERE id_usertg = ?";
    $update_stmt = $pdo->prepare($update_sql);
    $update_stmt->execute([$new_status, $id_usertg]);

    echo "Status updated successfully to " . $new_status;
} else {
    echo "User not found";
}
?>
