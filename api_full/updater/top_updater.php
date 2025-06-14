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

    // Добавление новых данных (без даты)
    $range = 'Top!A1';
    $body = new \Google_Service_Sheets_ValueRange([
        'values' => $values
    ]);
    $params = [
        'valueInputOption' => 'RAW'
    ];

    $result = $service->spreadsheets_values->update($spreadsheetId, $range, $body, $params);

    // Форматирование: шапка, призовые места, ширина, шрифт, центровка
    $colCount = count($values[0]);
    $rowCount = count($values);

    $requests = [];

    // Форматирование шапки (первая строка) с жирной черной обводкой только сверху и снизу
    $requests[] = [
        'repeatCell' => [
            'range' => [
                'sheetId' => 0,
                'startRowIndex' => 0,
                'endRowIndex' => 1,
                'startColumnIndex' => 0,
                'endColumnIndex' => $colCount
            ],
            'cell' => [
                'userEnteredFormat' => [
                    'backgroundColor' => ['red' => 0.9, 'green' => 0.9, 'blue' => 0.7],
                    'horizontalAlignment' => 'CENTER',
                    'verticalAlignment' => 'MIDDLE',
                    'textFormat' => [
                        'fontSize' => 14,
                        'bold' => true
                    ]
                ]
            ],
            'fields' => 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
        ]
    ];
    // Жирная черная обводка для шапки только сверху и снизу
    $requests[] = [
        'updateBorders' => [
            'range' => [
                'sheetId' => 0,
                'startRowIndex' => 0,
                'endRowIndex' => 1,
                'startColumnIndex' => 0,
                'endColumnIndex' => $colCount
            ],
            'top' => [
                'style' => 'SOLID_THICK',
                'color' => ['red' => 0, 'green' => 0, 'blue' => 0]
            ],
            'bottom' => [
                'style' => 'SOLID_THICK',
                'color' => ['red' => 0, 'green' => 0, 'blue' => 0]
            ],
            'left' => [
                'style' => 'SOLID_THICK',
                'color' => ['red' => 0, 'green' => 0, 'blue' => 0]
            ],
            'right' => [
                'style' => 'SOLID_THICK',
                'color' => ['red' => 0, 'green' => 0, 'blue' => 0]
            ],
            'innerHorizontal' => [
                'style' => 'SOLID_THICK',
                'color' => ['red' => 0, 'green' => 0, 'blue' => 0]
            ],
            'innerVertical' => [
                'style' => 'SOLID_THICK',
                'color' => ['red' => 0, 'green' => 0, 'blue' => 0]
            ]
        ]
    ];

    // Форматирование призовых мест (на всю строку, более прозрачно, с центровкой)
    $colors = [
        2 => ['red' => 1.0, 'green' => 0.84, 'blue' => 0.0, 'alpha' => 0.2],      // Gold
        3 => ['red' => 0.75, 'green' => 0.75, 'blue' => 0.75, 'alpha' => 0.2],     // Silver
        4 => ['red' => 0.8, 'green' => 0.5, 'blue' => 0.2, 'alpha' => 0.2],        // Bronze
    ];
    foreach ($colors as $row => $color) {
        $requests[] = [
            'repeatCell' => [
                'range' => [
                    'sheetId' => 0,
                    'startRowIndex' => $row - 1,
                    'endRowIndex' => $row,
                    'startColumnIndex' => 0,
                    'endColumnIndex' => $colCount
                ],
                'cell' => [
                    'userEnteredFormat' => [
                        'backgroundColorStyle' => [
                            'rgbColor' => [
                                'red' => $color['red'],
                                'green' => $color['green'],
                                'blue' => $color['blue'],
                                'alpha' => $color['alpha']
                            ]
                        ],
                        'horizontalAlignment' => 'CENTER',
                        'verticalAlignment' => 'MIDDLE',
                        'textFormat' => [
                            'fontSize' => 13,
                            'bold' => true
                        ]
                    ]
                ],
                'fields' => 'userEnteredFormat(backgroundColorStyle,textFormat,horizontalAlignment,verticalAlignment)'
            ]
        ];
    }

    // Обычная обводка для всех остальных строк (кроме шапки), без верхней границы первой строки после шапки
    $requests[] = [
        'updateBorders' => [
            'range' => [
                'sheetId' => 0,
                'startRowIndex' => 1,
                'endRowIndex' => $rowCount,
                'startColumnIndex' => 0,
                'endColumnIndex' => $colCount
            ],
            'top' => [
                'style' => 'NONE'
            ],
            'bottom' => [
                'style' => 'SOLID',
                'color' => ['red' => 0, 'green' => 0, 'blue' => 0]
            ],
            'left' => [
                'style' => 'SOLID',
                'color' => ['red' => 0, 'green' => 0, 'blue' => 0]
            ],
            'right' => [
                'style' => 'SOLID',
                'color' => ['red' => 0, 'green' => 0, 'blue' => 0]
            ],
            'innerHorizontal' => [
                'style' => 'SOLID',
                'color' => ['red' => 0, 'green' => 0, 'blue' => 0]
            ],
            'innerVertical' => [
                'style' => 'SOLID',
                'color' => ['red' => 0, 'green' => 0, 'blue' => 0]
            ]
        ]
    ];

    // Центровка и увеличение шрифта для всех остальных строк
    $requests[] = [
        'repeatCell' => [
            'range' => [
                'sheetId' => 0,
                'startRowIndex' => 1,
                'endRowIndex' => $rowCount,
                'startColumnIndex' => 0,
                'endColumnIndex' => $colCount
            ],
            'cell' => [
                'userEnteredFormat' => [
                    'horizontalAlignment' => 'CENTER',
                    'verticalAlignment' => 'MIDDLE',
                    'textFormat' => [
                        'fontSize' => 13
                    ]
                ]
            ],
            'fields' => 'userEnteredFormat(textFormat,horizontalAlignment,verticalAlignment)'
        ]
    ];

    // Увеличить ширину всех колонок
    for ($i = 0; $i < $colCount; $i++) {
        $requests[] = [
            'updateDimensionProperties' => [
                'range' => [
                    'sheetId' => 0,
                    'dimension' => 'COLUMNS',
                    'startIndex' => $i,
                    'endIndex' => $i + 1
                ],
                'properties' => [
                    'pixelSize' => 160
                ],
                'fields' => 'pixelSize'
            ]
        ];
    }

    // Применяем форматирование, если есть что форматировать
    if (!empty($requests)) {
        $batchUpdateRequest = new \Google_Service_Sheets_BatchUpdateSpreadsheetRequest([
            'requests' => $requests
        ]);
        $service->spreadsheets->batchUpdate($spreadsheetId, $batchUpdateRequest);
    }

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
        1 => "🥇",
        2 => "🥈",
        3 => "🥉"
    ];
    $place = 1;
    foreach ($rows as $row) {
        $place_str = isset($medals[$place]) ? $place . $medals[$place] : (string)$place;
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

// Убедитесь, что в Google Таблице есть лист с именем Top
// Убедитесь, что в Google Таблице есть лист с именем Top
