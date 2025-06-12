<?php
require_once 'db.php';
header('Content-Type: application/json');

try {
    $pdo = getDbConnection();

    // Получаем все уникальные tg_nick_manager из products
    $uniqueManagers = $pdo->query("SELECT DISTINCT tg_nick_manager FROM products WHERE tg_nick_manager IS NOT NULL AND tg_nick_manager != ''")->fetchAll(PDO::FETCH_COLUMN);

    $added = 0;
    foreach ($uniqueManagers as $managerUsername) {
        // Проверяем, существует ли уже такой менеджер
        $stmt = $pdo->prepare("SELECT manager_id FROM managers WHERE manager_username = ?");
        $stmt->execute([$managerUsername]);
        $managerIdInManagers = $stmt->fetchColumn();

        if ($managerIdInManagers === false) {
            // Ищем id_usertg по username в таблице users
            $userStmt = $pdo->prepare("SELECT id_usertg FROM users WHERE username = ?");
            $userStmt->execute([$managerUsername]);
            $managerId = $userStmt->fetchColumn();

            // Вставляем нового менеджера с manager_id и балансом 0
            $insert = $pdo->prepare("INSERT INTO managers (manager_username, manager_id, balance) VALUES (?, ?, 0)");
            $insert->execute([$managerUsername, $managerId]);
            $added++;
        } else if (empty($managerIdInManagers)) {
            // Если менеджер уже есть, но manager_id пустой, обновляем его
            $userStmt = $pdo->prepare("SELECT id_usertg FROM users WHERE username = ?");
            $userStmt->execute([$managerUsername]);
            $managerId = $userStmt->fetchColumn();

            if (!empty($managerId)) {
                $update = $pdo->prepare("UPDATE managers SET manager_id = ? WHERE manager_username = ?");
                $update->execute([$managerId, $managerUsername]);
            }
        }
    }

    echo json_encode(['success' => true, 'added' => $added]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
