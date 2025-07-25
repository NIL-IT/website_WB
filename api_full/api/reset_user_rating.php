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

// function sendTelegramMessage($chatId, $message) {
//     $botToken = "7077985036:AAFHZ-JKekDokComqzFC6-f7-uijdDeKlTw";
//     $apiUrl = "https://api.telegram.org/bot$botToken/sendMessage";
//     $postFields = [
//         'chat_id' => $chatId,
//         'text' => $message,
//         'parse_mode' => 'HTML'
//     ];
//     $ch = curl_init();
//     curl_setopt($ch, CURLOPT_URL, $apiUrl);
//     curl_setopt($ch, CURLOPT_POST, 1);
//     curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
//     curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//     curl_exec($ch);
//     curl_close($ch);
// }

try {
    $pdo = getDbConnection();
    $data = json_decode(file_get_contents('php://input'), true);
    $id_usertg = $data['id_usertg'] ?? null;
    $username = $data['username'] ?? null;

    if (!$id_usertg || !isAdmin($id_usertg, $pdo)) {
        echo json_encode(['status' => false, 'message' => 'Нет доступа']);
        exit;
    }

    if (!$username) {
        echo json_encode(['status' => false, 'message' => 'Не указан username']);
        exit;
    }

    // Убираем @ из username, если есть
    $username = ltrim($username, '@');

    // Получаем id_usertg по username
    $stmt = $pdo->prepare("SELECT id_usertg FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        echo json_encode(['status' => false, 'message' => 'Пользователь не найден']);
        exit;
    }

    $id_usertg_target = $row['id_usertg'];

    // Логирование сброса рейтинга пользователя
    $logDir = '/var/www/test_bot/logs/';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0777, true);
    }
    $logFile = $logDir . 'referral_reset_user_' . $username . '_' . date('Ymd_His') . '.log';
    $stmtLog = $pdo->prepare("SELECT * FROM referrals WHERE id_usertg = ?");
    $stmtLog->execute([$id_usertg_target]);
    $referralBefore = $stmtLog->fetch(PDO::FETCH_ASSOC);
    file_put_contents($logFile, json_encode($referralBefore, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    // Сброс score и invited для пользователя
    $stmt = $pdo->prepare("UPDATE referrals SET score = 0, invited = 0 WHERE id_usertg = ?");
    $stmt->execute([$id_usertg_target]);

    // Вызов top_updater.php после сброса рейтинга
    $topUpdaterPath = dirname(__DIR__) . '/updater/top_updater.php';
    if (file_exists($topUpdaterPath)) {
        include_once $topUpdaterPath;
    }

    // // Можно отправить сообщение пользователю, если нужно:
    // $message = "Ваш рейтинг был сброшен администратором.";
    // sendTelegramMessage($id_usertg_target, $message);

    echo json_encode(['status' => true]);
} catch (Exception $e) {
    echo json_encode(['status' => false, 'message' => $e->getMessage()]);
}
?>
