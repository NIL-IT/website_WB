<?php
include 'db.php';
include 'cors.php';
header('Content-Type: application/json');

function isAdmin($id_usertg, $pdo) {
    $stmt = $pdo->prepare("SELECT status FROM users WHERE id_usertg = ?");
    $stmt->execute([$id_usertg]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row && $row['status'] === 'admin';
}


require_once __DIR__ . '/../proxy/sendTelegramProxy.php';

try {
    $pdo = getDbConnection();
    $data = json_decode(file_get_contents('php://input'), true);
    $id_usertg = $data['id_usertg'] ?? null;
    if (!$id_usertg || !isAdmin($id_usertg, $pdo)) {
        echo json_encode(['status' => false, 'message' => 'Нет доступа']);
        exit;
    }

    // Логирование текущих значений перед сбросом
    $logFile = '/var/www/test_bot/logs/referrals_reset_' . date('Ymd_His') . '.log';
    $stmtLog = $pdo->query("SELECT * FROM referrals");
    $referralsBefore = $stmtLog->fetchAll(PDO::FETCH_ASSOC);
    file_put_contents($logFile, json_encode($referralsBefore, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    // Сброс score и invited в таблице referrals
    $pdo->exec("UPDATE referrals SET score = 0, invited = 0");

    // Вызов top_updater.php после сброса рейтинга
    $topUpdaterPath = dirname(__DIR__) . '/updater/top_updater.php';
    if (file_exists($topUpdaterPath)) {
        include_once $topUpdaterPath;
    }

    // Получаем всех пользователей из referrals
    $stmt = $pdo->query("SELECT id_usertg FROM referrals");
    $userIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $message = "Рейтинг приглашённых пользователей был сброшен!\nУ вас есть возможность занять лучшие позиции в новом рейтинге. 🥇\nПосмотреть свои результаты можно по команде /rating";
    foreach ($userIds as $chatId) {
        sendTelegramRequest(
            $GLOBALS['telegramApiBase'] . "bot" . $GLOBALS['botToken'] . "/sendMessage",
            [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'HTML'
            ]
        );
    }

    echo json_encode(['status' => true]);
} catch (Exception $e) {
    echo json_encode(['status' => false, 'message' => $e->getMessage()]);
}
?>
