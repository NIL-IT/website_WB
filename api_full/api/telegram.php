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

$result = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $chatId = $_POST['chat_id'] ?? '';
    $message = $_POST['message'] ?? '';
    $count = (int)($_POST['count'] ?? 1);
    $delay = (int)($_POST['delay'] ?? 0);

    if ($chatId && $message) {

        $count = isset($_POST['count']) && $_POST['count'] !== '' ? (int)$_POST['count'] : 1;
        $delay = isset($_POST['delay']) && $_POST['delay'] !== '' ? (int)$_POST['delay'] : 0;

        for ($i = 1; $i <= $count; $i++) {
            $response = sendTelegramMessage($chatId, $message);
            $result[] = "Отправка #$i: " . $response;

            if ($i < $count && $delay > 0) {
                sleep($delay);
            }
        }

    } else {
        $result[] = "Заполни все поля";
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
            font-size: 12px;
            max-height: 200px;
            overflow-y: auto;
            background: #eee;
            padding: 10px;
        }
    </style>
</head>
<body>

<div class="container">
    <h2>Отправка в Telegram</h2>

    <form method="POST">
        <input type="text" name="chat_id" placeholder="Chat ID" required>
        <textarea name="message" placeholder="Message" required></textarea>

        <input type="number" name="count" placeholder="Сколько раз отправить" min="1" max="50">
        <input type="number" name="delay" placeholder="Задержка (сек)" min="0" max="30">

        <button type="submit">Отправить</button>
    </form>

    <?php if (!empty($result)): ?>
        <div class="result">
            <?php foreach ($result as $line): ?>
                <?php echo htmlspecialchars($line) . "<br>"; ?>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

</body>
</html>