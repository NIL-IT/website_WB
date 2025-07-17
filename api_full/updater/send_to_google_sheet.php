<?php
require_once 'db.php';
require __DIR__ . '/vendor/autoload.php';

// Функция для отправки данных в Google Таблицу пакетами по 100 строк
function sendDataToGoogleSheet($values) {
    putenv('GOOGLE_APPLICATION_CREDENTIALS=/var/www/test_bot/updater/cred.json');
    $client = new \Google_Client();
    $client->useApplicationDefaultCredentials();
    $client->addScope(\Google_Service_Sheets::SPREADSHEETS);

    $service = new \Google_Service_Sheets($client);
    $spreadsheetId = '1ViIZra4qli2h67i2bdlqyqKZIV4b1Cy5buNCG9BF3tg';
    $range = 'Product!A1:Z';

    // Очистка данных
    $clearRequest = new \Google_Service_Sheets_ClearValuesRequest();
    $service->spreadsheets_values->clear($spreadsheetId, $range, $clearRequest);

    // Добавление текущей даты в качестве первой строки
    $date = date('Y-m-d H:i:s');
    $header = array_shift($values); // заголовок
    $headerRows = [
        ["Дата обновления:", $date],
        $header
    ];

    // Сначала отправляем дату и заголовок
    $body = new \Google_Service_Sheets_ValueRange([
        'values' => $headerRows
    ]);
    $params = [
        'valueInputOption' => 'RAW',
        'insertDataOption' => 'INSERT_ROWS'
    ];
    $service->spreadsheets_values->update($spreadsheetId, 'Product!A1', $body, ['valueInputOption' => 'RAW']);

    // Теперь отправляем данные чанками по 100 строк
    $chunkSize = 100;
    $totalUpdated = 0;
    $startRow = 3; // после даты и заголовка

    foreach (array_chunk($values, $chunkSize) as $chunk) {
        $range = "Product!A{$startRow}";
        $body = new \Google_Service_Sheets_ValueRange([
            'values' => $chunk
        ]);
        $result = $service->spreadsheets_values->append(
            $spreadsheetId,
            $range,
            $body,
            [
                'valueInputOption' => 'RAW',
                'insertDataOption' => 'INSERT_ROWS'
            ]
        );
        $updatedCells = $result->getUpdates()->getUpdatedCells();
        $totalUpdated += $updatedCells;
        $startRow += count($chunk);
    }
    return $totalUpdated;
}

try {
    $pdo = getDbConnection();

    // Получение данных из steps и соответствующих данных из users и products
    $stmt = $pdo->prepare("
    SELECT s.id AS step_id, s.id_product, s.id_usertg AS step_user_id, s.step, s.image1, s.image2, s.image3, s.image4, s.image5, s.image6, s.image7, s.updated_at, s.verified, s.paid, s.receipt_image, s.modified_payment, s.receipt_timestamp,
        u1.username AS step_username, 
        p.tg_nick, p.name AS product_name, p.image_path AS product_image_path, p.article, p.expire, p.market_price, p.your_price,
        u2.id_usertg AS product_user_id, u2.username AS product_username
    FROM steps s
    LEFT JOIN users u1 ON s.id_usertg = u1.id_usertg
    LEFT JOIN products p ON s.id_product = p.id
    LEFT JOIN users u2 ON p.tg_nick = u2.username
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

        $values[] = [
            (string)$row['step_id'], 
            (string)$row['step_user_id'], 
            (string)$row['step_username'], 
            (string)$row['product_user_id'], 
            (string)$row['product_username'],
            (string)$row['product_name'],
            (string)$row['article'],
            (string)$profit, // Выгода покупателя
            (string)$inIssue, // Новое поле "Товар в выдаче?"
            (string)'https://inhomeka.online:8000/' . $row['product_image_path'],
            (string)$row['step'],
            (string)$updatedAt,
            (string)$telegramUrl,
            (string)$verifiedStatus,
            (string)$paidStatus,
            (string)(!empty($row['image1']) ? 'https://inhomeka.online:8000/' . $row['image1'] : 'Шаг не пройден'), // Скрин товара в конкурентной выдаче
            (string)(!empty($row['image2']) ? 'https://inhomeka.online:8000/' . $row['image2'] : 'Шаг не пройден'), // Скрин корзины
            (string)(!empty($row['image3']) ? 'https://inhomeka.online:8000/' . $row['image3'] : 'Шаг не пройден'), // Скрин подписки
            (string)(!empty($row['image4']) ? 'https://inhomeka.online:8000/' . $row['image4'] : 'Шаг не пройден'), // Скрин заказа
            (string)(!empty($row['image5']) ? 'https://inhomeka.online:8000/' . $row['image5'] : 'Шаг не пройден'), // Скриншот о доставке
            (string)(!empty($row['image6']) ? 'https://inhomeka.online:8000/' . $row['image6'] : 'Шаг не пройден'), // Скриншот отзыва
            (string)(!empty($row['image7']) ? 'https://inhomeka.online:8000/' . $row['image7'] : 'Шаг не пройден'),  // Фотография с разрезанным штрих-кодом на фоне товара
            (string)(!empty($row['receipt_image']) ? 'https://inhomeka.online:8000/' . $row['receipt_image'] : 'Чек не приложен'),  // Чек
            (string)$receiptTimestamp // Время фиксирования чека
        ];
    }

    // Отправка данных в Google Таблицу пакетами
    $updatedCells = sendDataToGoogleSheet($values);
    echo "$updatedCells cells updated in Google Sheet.\n";

} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
}
?>