
<?php
// Универсальные функции отправки сообщений в Telegram
$telegramApiBase = "http://89.124.69.52:8080/";
$botToken = "7077985036:AAFHZ-JKekDokComqzFC6-f7-uijdDeKlTw";


// Отправка трёх сообщений пользователю после Excel-оплаты
function sendExcelPaymentMessages($chat_id, $referral_id = null) {
    global $telegramApiBase, $botToken;
    $api_url = $telegramApiBase . "bot$botToken/sendMessage";

    // 1. Спасибо за участие
    $message = "❤️ Спасибо за участие! Ваш заказ был отправлен на оплату!";
    $post_fields = [
        'chat_id' => $chat_id,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];
    sendTelegramRequest($api_url, $post_fields);

    // 2. Приглашение пригласить друзей
    $message = "🎉 Приглашайте в закрытый клуб своих друзей, чтобы они тоже могли покупать с выгодой и участвовать в развитии бренда. Чтобы пригласить друга - просто перешлите ему сообщение ниже:";
    $post_fields = [
        'chat_id' => $chat_id,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];
    sendTelegramRequest($api_url, $post_fields);

    // 3. Персональная пригласительная ссылка
    if (!$referral_id) {
        $referral_id = "unknown";
    }
    $invite_link = "https://t.me/wb_cashback_nsk_bot?start=ref" . $referral_id;
    $message = "Привет! Я нашел закрытый клуб бренда товаров для дома INHOMEKA, там раздают товары бренда с кэшбеком 80-100%, а еще можно поучаствовать в развитии бренда и получить за это бонусы! 🎁\n\n"
        . "🔵 Это моя <a href='$invite_link'>персональная пригласительная ссылка</a> для тебя.\n"
        . "Вступай в клуб и становись частью закрытого сообщества бренда INHOMEKA.";
    $post_fields = [
        'chat_id' => $chat_id,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];
    sendTelegramRequest($api_url, $post_fields);
}

function sendTelegramMessageWithComment($chatId, $comment) {
    global $telegramApiBase, $botToken;
    $apiUrl = $telegramApiBase . "bot$botToken/sendMessage";
    $message = "Комментарий: $comment";
    $postFields = [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];
    sendTelegramRequest($apiUrl, $postFields);
}

function sendTelegramMessageWithReceipt($chatId, $imagePath) {
    global $telegramApiBase, $botToken;
    $apiUrl = $telegramApiBase . "bot$botToken/sendPhoto";
    $fullImagePath = '/var/www/test_bot/api/' . $imagePath;
    $caption = "❤️ Спасибо за участие! Ваш чек ниже";
    $postFields = [
        'chat_id' => $chatId,
        'caption' => $caption,
        'parse_mode' => 'HTML',
        'photo' => new CURLFile($fullImagePath)
    ];
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}

function sendTelegramInvitationMessage($chatId, $id_usertg) {
    global $telegramApiBase, $botToken;
    $apiUrl = $telegramApiBase . "bot$botToken/sendMessage";
    $referralApiUrl = "https://inhomeka.online:8000/referral.php";
    $postData = json_encode(['id_usertg' => $id_usertg]);
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
    $message1 = "🎉 Приглашайте в закрытый клуб своих друзей, чтобы они тоже могли покупать с выгодой и участвовать в развитии бренда. Чтобы пригласить друга - просто перешлите ему сообщение ниже:";
    $postFields1 = [
        'chat_id' => $chatId,
        'text' => $message1,
        'parse_mode' => 'HTML'
    ];
    sendTelegramRequest($apiUrl, $postFields1);
    $inviteLink = "https://t.me/wb_cashback_nsk_bot?start=ref" . $referral_id;
    $message2 = "Привет! Я нашел закрытый клуб бренда товаров для дома INHOMEKA, там раздают товары бренда с кэшбеком 80-100%, а еще можно поучаствовать в развитии бренда и получить за это бонусы! 🎁\n\n"
        . "🔵 Это моя <a href='$inviteLink'>персональная пригласительная ссылка</a> для тебя.\n"
        . "Вступай в клуб и становись частью закрытого сообщества бренда INHOMEKA.";
    $postFields2 = [
        'chat_id' => $chatId,
        'text' => $message2,
        'parse_mode' => 'HTML'
    ];
    sendTelegramRequest($apiUrl, $postFields2);
}

function sendAdminNotification($message) {
    global $telegramApiBase, $botToken;
    $apiUrl = $telegramApiBase . "bot$botToken/sendMessage";
    $adminChatId = 934574143;
    $postFields = [
        'chat_id' => $adminChatId,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];
    sendTelegramRequest($apiUrl, $postFields);
}

function sendTelegramRequest($url, $fields) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}
function sendTelegramMessage($chatId, $dealNumber, $productName, $userName, $userHandle, $async = false) {
    $message = "<b>Заказ оформлен</b>\nСделка№ $dealNumber\n\nТовар: $productName\nПользователь: $userName\n(@$userHandle)";
    
    return sendTelegramRequest(
        $GLOBALS['telegramApiBase'] . "bot" . $GLOBALS['botToken'] . "/sendMessage",
        [
            'chat_id' => $chatId,
            'text' => $message,
            'parse_mode' => 'HTML'
        ]
    );
}
function sendTelegramMessage_final($chatId, $dealNumber, $productName, $userName, $userHandle, $async = false) {
    $message = "<b>Заказ получен</b>\nСделка№ $dealNumber\n\nТовар: $productName\nПользователь: $userName\n(@$userHandle)";
    
    $report_url = "https://inhomeka.online:81/?id=$dealNumber";

    $reply_markup = json_encode([
        'inline_keyboard' => [[[
            'text' => 'Отчет',
            'web_app' => ['url' => $report_url]
        ]]]
    ]);

    return sendTelegramRequest(
        $GLOBALS['telegramApiBase'] . "bot" . $GLOBALS['botToken'] . "/sendMessage",
        [
            'chat_id' => $chatId,
            'text' => $message,
            'parse_mode' => 'HTML',
            'reply_markup' => $reply_markup
        ]
    );
}
?>