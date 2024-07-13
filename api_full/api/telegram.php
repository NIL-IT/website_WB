<?php
$id = isset($_GET['id']) ? $_GET['id'] : '';
$reportUrl = "https://testingnil.ru/report/{$id}";
$admin_id = -4244600119;
$encoded_admin_id = urlencode($admin_id);

// Формирование полной ссылки для использования
$telegramUrl = "https://api.telegram.org/bot7077985036:AAFHZ-JKekDokComqzFC6-f7-uijdDeKlTw/sendMessage?chat_id={$encoded_admin_id}&parse_mode=HTML&text=<b>Формирование отчёта по запросу</b>%0AСделка№{$id}&reply_markup={\"inline_keyboard\":[[{\"text\":\"Отчет\",\"web_app\":{\"url\":\"{$reportUrl}\"}}]]}";


$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $telegramUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

// Обработка ответа, если необходимо
if (!$response) {
    echo "Ошибка при выполнении запроса в Telegram: " . curl_error($ch) . "\n";
} else {
    echo "Отчёт успешно отправлен\n";
}
?>
