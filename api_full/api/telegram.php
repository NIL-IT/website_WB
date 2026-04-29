<?php

$telegramApiBase = "http://89.124.69.52:8080/";
$botToken = "7077985036:AAFHZ-JKekDokComqzFC6-f7-uijdDeKlTw";

function sendTelegramMessage($chatId, $message) {
    global $telegramApiBase, $botToken;

    $apiUrl = $telegramApiBase . "bot$botToken/sendMessage";

    $postFields = [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        $error = curl_error($ch);
    }

    curl_close($ch);

    return isset($error) ? $error : $response;
}

$result = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $chatId = $_POST['chat_id'] ?? '';
    $message = $_POST['message'] ?? '';

    if ($chatId && $message) {
        $result = sendTelegramMessage($chatId, $message);
    } else {
        $result = "Заполни все поля";
    }
}

?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Telegram Sender</title>
    <style>
        body {
            font-family: Arial;
            background: #f5f5f5;
            padding: 50px;
        }
        .container {
            max-width: 400px;
            margin: auto;
            background: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        input, textarea {
            width: 100%;
            margin-bottom: 10px;
            padding: 10px;
        }
        button {
            width: 100%;
            padding: 10px;
            background: #2AABEE;
            color: white;
            border: none;
            cursor: pointer;
        }
        .result {
            margin-top: 15px;
            word-break: break-all;
        }
    </style>
</head>
<body>

<div class="container">
    <h2>Отправка в Telegram</h2>

    <form method="POST">
        <input type="text" name="chat_id" placeholder="Chat ID" required>
        <textarea name="message" placeholder="Message" required></textarea>
        <button type="submit">Отправить</button>
    </form>

    <?php if ($result): ?>
        <div class="result">
            <strong>Ответ:</strong><br>
            <?php echo htmlspecialchars($result); ?>
        </div>
    <?php endif; ?>
</div>

</body>
</html>