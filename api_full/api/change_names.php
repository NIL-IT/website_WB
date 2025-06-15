<?php
header('Content-Type: application/json');
require 'db.php';

try {
    $conn = getDbConnection();

    // Найти дубликаты username
    $sql = "SELECT username FROM users GROUP BY username HAVING COUNT(*) > 1";
    $stmt = $conn->query($sql);
    $duplicateUsernames = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $deletedUsers = [];
    foreach ($duplicateUsernames as $username) {
        // Получить всех пользователей с этим username
        $stmtUsers = $conn->prepare("SELECT id, id_userTG FROM users WHERE username = :username");
        $stmtUsers->bindParam(':username', $username, PDO::PARAM_STR);
        $stmtUsers->execute();
        $users = $stmtUsers->fetchAll(PDO::FETCH_ASSOC);

        foreach ($users as $user) {
            $id_userTG = $user['id_userTG'];
            // Проверить наличие записей в steps
            $stmtSteps = $conn->prepare("SELECT 1 FROM steps WHERE id_userTG = :id_userTG LIMIT 1");
            $stmtSteps->bindParam(':id_userTG', $id_userTG, PDO::PARAM_INT);
            $stmtSteps->execute();
            $hasSteps = $stmtSteps->fetchColumn();

            if (!$hasSteps) {
                // Удалить пользователя, если нет записей в steps
                $stmtDelete = $conn->prepare("DELETE FROM users WHERE id = :id");
                $stmtDelete->bindParam(':id', $user['id'], PDO::PARAM_INT);
                $stmtDelete->execute();
                $deletedUsers[] = $user['id'];
            }
            // Если есть записи в steps, пропустить
        }
    }

    echo json_encode([
        "success" => true,
        "deletedUsers" => $deletedUsers,
        "message" => "Операция завершена"
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Ошибка: " . $e->getMessage()
    ]);
}
?>
