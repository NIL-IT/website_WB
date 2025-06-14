<?php
require_once 'db.php';
require __DIR__ . '/vendor/autoload.php';

// Функция для отправки данных в Google Таблицу (аналогично send_to_google_sheet.php)
function sendTopToGoogleSheet($values) {
    putenv('GOOGLE_APPLICATION_CREDENTIALS=' . __DIR__ . '/cred_top.json');
    $client = new \Google_Client();
    $client->useApplicationDefaultCredentials();
    $client->addScope(\Google_Service_Sheets::SPREADSHEETS);

    $service = new \Google_Service_Sheets($client);
    $spreadsheetId = '1PmVLp2XFiRHu9YedVD7mvgmdqKcS6FPkbti96fF1j9w';
    $range = 'Top!A1:Z';

    // Очистка данных
    $clearRequest = new \Google_Service_Sheets_ClearValuesRequest();
    $service->spreadsheets_values->clear($spreadsheetId, $range, $clearRequest);

    // Добавление текущей даты в качестве первой строки
    $date = date('Y-m-d H:i:s');
    array_unshift($values, ["Дата обновления:", $date]);

    // Добавление новых данных
    $range = 'Top!A1';
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

    // Получаем данные из referrals, users
    $stmt = $pdo->prepare("
        SELECT r.id_usertg, r.score, r.invited, u.username
        FROM referrals r
        LEFT JOIN users u ON r.id_usertg = u.id_usertg
        WHERE r.score > 0
    ");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Сортировка по правилам: score DESC, invited DESC, username ASC
    usort($rows, function($a, $b) {
        if ($a['score'] != $b['score']) {
            return $b['score'] - $a['score'];
        }
        if ($a['invited'] != $b['invited']) {
            return $b['invited'] - $a['invited'];
        }
        return strcmp(mb_strtolower($a['username']), mb_strtolower($b['username']));
    });

    // Формируем таблицу как массив массивов (первая строка — заголовки)
    $table = [["Место", "Username", "Очки", "Приглашённых"]];
    $medals = [
        1 => "1🥇",
        2 => "2🥈",
        3 => "3🥉"
    ];
    $place = 1;
    foreach ($rows as $row) {
        $place_str = isset($medals[$place]) ? $place . " " . $medals[$place] : (string)$place;
        $table[] = [
            $place_str,
            $row['username'],
            $row['score'],
            $row['invited']
        ];
        $place++;
    }

    // Отправка в Google Таблицу
    $updatedCells = sendTopToGoogleSheet($table);
    echo "$updatedCells cells updated in Google Sheet (Top).\n";

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

// Проверьте, что client_email из cred_top.json добавлен в доступ к Google Таблице как редактор!
