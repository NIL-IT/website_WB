<?php
require 'vendor/autoload.php';
include 'db.php';

// --- Функция получения/создания referral_id (локально, не через require referral.php) ---
function getOrCreateReferralId($pdo, $id_usertg) {
    $stmt = $pdo->prepare("SELECT referral_id FROM users WHERE id_usertg = ?");
    $stmt->execute([$id_usertg]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $referral_id = $row['referral_id'] ?? null;
    if ($referral_id) {
        return $referral_id;
    }
    // Генерируем и сохраняем новый referral_id
    $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    $length = 6;
    do {
        $referral_id = '';
        for ($i = 0; $i < $length; $i++) {
            $referral_id .= $characters[random_int(0, strlen($characters) - 1)];
        }
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM users WHERE referral_id = ?");
        $stmtCheck->execute([$referral_id]);
        $exists = $stmtCheck->fetchColumn() > 0;
    } while ($exists);
    $update = $pdo->prepare("UPDATE users SET referral_id = ? WHERE id_usertg = ?");
    $update->execute([$referral_id, $id_usertg]);
    return $referral_id;
}

$pdo = getDbConnection();

// Получаем step_ids из последней записи excel_steps_count
$stmtLast = $pdo->query("SELECT id, step_ids FROM excel_steps_count ORDER BY id DESC LIMIT 1");
$lastRow = $stmtLast->fetch(PDO::FETCH_ASSOC);
$stepIds = [];
$excelCountId = null;
if ($lastRow && !empty($lastRow['step_ids'])) {
    $stepIds = json_decode($lastRow['step_ids'], true);
    if (!is_array($stepIds)) $stepIds = [];
    $excelCountId = $lastRow['id'];
}

if (empty($stepIds)) {
    // Если нет id для обновления, просто обновляем pay = true для последней строки
    if ($lastRow && !empty($lastRow['id'])) {
        $excelCountId = $lastRow['id'];
        $stmtPay = $pdo->prepare("UPDATE excel_steps_count SET pay = true WHERE id = ?");
        $stmtPay->execute([$excelCountId]);
        echo json_encode(['success' => true, 'message' => 'pay обновлено без id']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Нет id для обновления']);
    }
    exit;
}

$inQuery = implode(',', array_fill(0, count($stepIds), '?'));

// Получаем эти строки для отправки сообщений
$stmt = $pdo->prepare("SELECT * FROM steps WHERE id IN ($inQuery)");
$stmt->execute($stepIds);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

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

        // Получение referral_id через локальную функцию
        $referral_id = getOrCreateReferralId($pdo, $chatId);

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

        // --- ОПЛАТА МЕНЕДЖЕРА ---
        // Получаем tg_nick_manager, market_price, your_price из products
        $id_product = $row['id_product'];
        $stmtProduct = $pdo->prepare("SELECT tg_nick_manager, market_price, your_price FROM products WHERE id = ?");
        $stmtProduct->execute([$id_product]);
        $product = $stmtProduct->fetch(PDO::FETCH_ASSOC);

        // Получаем modified_payment из steps
        $modified_payment = $row['modified_payment'];

        if ($product && !empty($product['tg_nick_manager'])) {
            $manager_username = $product['tg_nick_manager'];
            $stmtManager = $pdo->prepare("SELECT manager_id, balance FROM managers WHERE manager_username = ?");
            $stmtManager->execute([$manager_username]);
            $manager = $stmtManager->fetch(PDO::FETCH_ASSOC);

            if ($manager) {
                $manager_id = $manager['manager_id'];
                $balance = $manager['balance'];
                // Определяем сумму для изменения
                $sum = $modified_payment !== null ? $modified_payment : ($product['market_price'] - $product['your_price']);
                // Отнимаем сумму с баланса
                $new_balance = $balance - $sum;
                $stmtUpdateManager = $pdo->prepare("UPDATE managers SET balance = ? WHERE manager_id = ?");
                $stmtUpdateManager->execute([$new_balance, $manager_id]);
            }
        }
    }
}

// Теперь меняем статус только для этих id
$stmtUpdate = $pdo->prepare("UPDATE steps SET in_excel = false, status = 3, paid	= true WHERE id IN ($inQuery)");
$stmtUpdate->execute($stepIds);

// После всех операций обновляем pay на true для этой строки excel_steps_count
if ($excelCountId) {
    $stmtPay = $pdo->prepare("UPDATE excel_steps_count SET pay = true WHERE id = ?");
    $stmtPay->execute([$excelCountId]);
}

echo json_encode(['success' => true]);
