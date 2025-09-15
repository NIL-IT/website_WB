<?php
require 'vendor/autoload.php';
include 'db.php';

// if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
//     http_response_code(405);
//     echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
//     exit;
// }

$pdo = getDbConnection();

// Получаем step_ids из последней записи excel_steps_count
$stmtLast = $pdo->query("SELECT step_ids FROM excel_steps_count ORDER BY id DESC LIMIT 1");
$lastRow = $stmtLast->fetch(PDO::FETCH_ASSOC);
$stepIds = [];
if ($lastRow && !empty($lastRow['step_ids'])) {
    $stepIds = json_decode($lastRow['step_ids'], true);
    if (!is_array($stepIds)) $stepIds = [];
}

if (empty($stepIds)) {
    echo json_encode(['success' => false, 'message' => 'Нет id для обновления']);
    exit;
}

// Меняем статус только для этих id
$inQuery = implode(',', array_fill(0, count($stepIds), '?'));

// Получаем эти строки для отправки сообщений
$stmt = $pdo->prepare("SELECT * FROM steps WHERE id IN ($inQuery)");
$stmt->execute($stepIds);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Отправка сообщений в Telegram только если status != 3
foreach ($rows as $row) {
    if (!empty($row['id_usertg']) && (int)$row['status'] !== 3) {
        $chatId = $row['id_usertg'];
        $botToken = "7077985036:AAFHZ-JKekDokComqzFC6-f7-uijdDeKlTw";
        $apiUrl = "https://api.telegram.org/bot$botToken/sendMessage";
        // Первое сообщение
        $message1 = "❤️ Спасибо за участие! Ваш заказ был отправлен на оплату!";
        $postFields1 = [
            'chat_id' => $chatId,
            'text' => $message1,
            'parse_mode' => 'HTML'
        ];
        $ch1 = curl_init();
        curl_setopt($ch1, CURLOPT_URL, $apiUrl);
        curl_setopt($ch1, CURLOPT_POST, true);
        curl_setopt($ch1, CURLOPT_POSTFIELDS, $postFields1);
        curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch1, CURLOPT_SSL_VERIFYPEER, false);
        curl_exec($ch1);
        curl_close($ch1);
        // Второе сообщение
        $message2 = "🎉 Приглашайте в закрытый клуб своих друзей, чтобы они тоже могли покупать с выгодой и участвовать в развитии бренда. Чтобы пригласить друга - просто перешлите ему сообщение ниже:";
        $postFields2 = [
            'chat_id' => $chatId,
            'text' => $message2,
            'parse_mode' => 'HTML'
        ];
        $ch2 = curl_init();
        curl_setopt($ch2, CURLOPT_URL, $apiUrl);
        curl_setopt($ch2, CURLOPT_POST, true);
        curl_setopt($ch2, CURLOPT_POSTFIELDS, $postFields2);
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
        curl_exec($ch2);
        curl_close($ch2);
        // Третье сообщение с персональной ссылкой
        $referralApiUrl = "https://inhomeka.online:8000/referral.php";
        $postData = json_encode(['id_usertg' => $chatId]);
        $ch = curl_init($referralApiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        $response = curl_exec($ch);
        curl_close($ch);
        $referral_id = null;
        if ($response) {
            $referralData = json_decode($response, true);
            if (isset($referralData['success']) && $referralData['success'] && isset($referralData['referral_id'])) {
                $referral_id = $referralData['referral_id'];
            }
        }
        if (!$referral_id) {
            $referral_id = "unknown";
        }
        $inviteLink = "https://t.me/wb_cashback_nsk_bot?start=ref" . $referral_id;
        $message3 = "Привет! Я нашел закрытый клуб бренда товаров для дома INHOMEKA, там раздают товары бренда с кэшбеком 80-100%, а еще можно поучаствовать в развитии бренда и получить за это бонусы! 🎁\n\n"
            . "🔵 Это моя <a href='$inviteLink'>персональная пригласительная ссылка</a> для тебя.\n"
            . "Вступай в клуб и становись частью закрытого сообщества бренда INHOMEKA.";
        $postFields3 = [
            'chat_id' => $chatId,
            'text' => $message3,
            'parse_mode' => 'HTML'
        ];
        $ch3 = curl_init();
        curl_setopt($ch3, CURLOPT_URL, $apiUrl);
        curl_setopt($ch3, CURLOPT_POST, true);
        curl_setopt($ch3, CURLOPT_POSTFIELDS, $postFields3);
        curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch3, CURLOPT_SSL_VERIFYPEER, false);
        curl_exec($ch3);
        curl_close($ch3);
    }
}

// Теперь меняем статус только для этих id
$stmtUpdate = $pdo->prepare("UPDATE steps SET in_excel = false, status = 3 WHERE id IN ($inQuery)");
$stmtUpdate->execute($stepIds);

echo json_encode(['success' => true]);
