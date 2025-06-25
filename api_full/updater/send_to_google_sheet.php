<?php
require_once 'db.php';
require __DIR__ . '/vendor/autoload.php';

// Функция для отправки данных в Google Таблицу
function sendDataToGoogleSheet($values) {
    putenv('GOOGLE_APPLICATION_CREDENTIALS=/var/www/test_bot/updater/cred.json');
    $client = new \Google_Client();
    $client->useApplicationDefaultCredentials();
    $client->addScope(\Google_Service_Sheets::SPREADSHEETS);

    $service = new \Google_Service_Sheets($client);
    $spreadsheetId = '1ViIZra4qli2h67i2bdlqyqKZIV4b1Cy5buNCG9BF3tg';
    $range = 'Product!A1:Z'; // Укажите диапазон для очистки

    // Очистка данных
    $clearRequest = new \Google_Service_Sheets_ClearValuesRequest();
    $service->spreadsheets_values->clear($spreadsheetId, $range, $clearRequest);

    // Добавление текущей даты в качестве первой строки
    $date = date('Y-m-d H:i:s');
    array_unshift($values, ["Дата обновления:", $date]);

    // Добавление новых данных
    $range = 'Product!A1';
    $body = new \Google_Service_Sheets_ValueRange([
        'values' => $values
    ]);
    $params = [
        'valueInputOption' => 'RAW'
    ];

    $result = $service->spreadsheets_values->update($spreadsheetId, $range, $body, $params);
    return $result->getUpdatedCells();
}

try {
    $pdo = getDbConnection();

    // Новый, более быстрый запрос без LEFT JOIN users u2 (он не нужен для product_user_id/username)
    $stmt = $pdo->prepare("
        SELECT 
            s.id AS step_id, s.id_product, s.id_usertg AS step_user_id, s.step, s.image1, s.image2, s.image3, s.image4, s.image5, s.image6, s.image7, s.updated_at, s.verified, s.paid, s.receipt_image, s.modified_payment, s.receipt_timestamp,
            u1.username AS step_username, 
            p.tg_nick, p.name AS product_name, p.image_path AS product_image_path, p.article, p.expire, p.market_price, p.your_price
        FROM steps s
        LEFT JOIN users u1 ON s.id_usertg = u1.id_usertg
        LEFT JOIN products p ON s.id_product = p.id
    ");
    $stmt->execute();
    $stepsData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Подготовка данных для отправки в Google Таблицу
    $values = [["# Отчёта", "ID покупателя", "Username покупателя", "ID продавца", "Username продавца", "Название товара", "Артикул товара", "Выгода покупателя", "Товар в выдаче?", "Путь до изображения товара", "Номер шага", "Дата перехода на 1 шаг", "Ссылка на отчёт", "Подтверждён товар?", "Оплачен товар?", "Скрин товара в конкурентной выдаче", "Скрин корзины", "Скрин подписки", "Скрин заказа", "Скриншот о доставке", "Скриншот отзыва", "Фотография с разрезанным штрих-кодом на фоне товара", "Чек", "Время фиксирования чека"]];

    foreach ($stepsData as $row) {
        $updatedAt = !empty($row['updated_at']) ? $row['updated_at'] : 'Шаг не пройден';
        $telegramUrl = "https://inhomeka.online:81/?id=" . $row['step_id'];
        $inIssue = $row['expire'] ? 'Нет' : 'Да';

        // Вычисление выгоды покупателя
        $profit = !is_null($row['modified_payment']) ? $row['modified_payment'] : ($row['market_price'] - $row['your_price']);

        $verifiedStatus = $row['verified'] ? 'Подтверждён' : 'Не подтвержден';
        $paidStatus = $row['paid'] ? 'Оплачен' : 'Не оплачен';
        $receiptTimestamp = !empty($row['receipt_timestamp']) ? $row['receipt_timestamp'] : 'Время не указано';

        // product_user_id и product_username убираем, чтобы не делать лишний join
        $values[] = [
            (string)$row['step_id'], 
            (string)$row['step_user_id'], 
            (string)$row['step_username'], 
            '', // ID продавца (нет быстрого способа, если нужно — отдельный запрос по tg_nick)
            '', // Username продавца (нет быстрого способа, если нужно — отдельный запрос по tg_nick)
            (string)$row['product_name'],
            (string)$row['article'],
            (string)(!is_null($row['modified_payment']) ? $row['modified_payment'] : ($row['market_price'] - $row['your_price'])),
            (string)($row['expire'] ? 'Нет' : 'Да'),
            (string)'https://inhomeka.online:8000/' . $row['product_image_path'],
            (string)$row['step'],
            (string)(!empty($row['updated_at']) ? $row['updated_at'] : 'Шаг не пройден'),
            (string)("https://inhomeka.online:81/?id=" . $row['step_id']),
            (string)($row['verified'] ? 'Подтверждён' : 'Не подтвержден'),
            (string)($row['paid'] ? 'Оплачен' : 'Не оплачен'),
            (string)(!empty($row['image1']) ? 'https://inhomeka.online:8000/' . $row['image1'] : 'Шаг не пройден'),
            (string)(!empty($row['image2']) ? 'https://inhomeka.online:8000/' . $row['image2'] : 'Шаг не пройден'),
            (string)(!empty($row['image3']) ? 'https://inhomeka.online:8000/' . $row['image3'] : 'Шаг не пройден'),
            (string)(!empty($row['image4']) ? 'https://inhomeka.online:8000/' . $row['image4'] : 'Шаг не пройден'),
            (string)(!empty($row['image5']) ? 'https://inhomeka.online:8000/' . $row['image5'] : 'Шаг не пройден'),
            (string)(!empty($row['image6']) ? 'https://inhomeka.online:8000/' . $row['image6'] : 'Шаг не пройден'),
            (string)(!empty($row['image7']) ? 'https://inhomeka.online:8000/' . $row['image7'] : 'Шаг не пройден'),
            (string)(!empty($row['receipt_image']) ? 'https://inhomeka.online:8000/' . $row['receipt_image'] : 'Чек не приложен'),
            (string)(!empty($row['receipt_timestamp']) ? $row['receipt_timestamp'] : 'Время не указано')
        ];
    }

    // Отправка данных в Google Таблицу
    $updatedCells = sendDataToGoogleSheet($values);
    echo "$updatedCells cells updated in Google Sheet.\n";

} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
}
?>