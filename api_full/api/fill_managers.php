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
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM managers WHERE manager_username = ?");
        $stmt->execute([$managerUsername]);
        $exists = $stmt->fetchColumn();

        if (!$exists) {
            // Вставляем нового менеджера с балансом 0
            $insert = $pdo->prepare("INSERT INTO managers (manager_username, balance) VALUES (?, 0)");
            $insert->execute([$managerUsername]);
            $added++;
        }
    }

    echo json_encode(['success' => true, 'added' => $added]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
