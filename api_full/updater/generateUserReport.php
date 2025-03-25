<?php
include 'db.php';
header('Content-Type: application/json');

// Подключение библиотеки PhpSpreadsheet
require 'vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

// Увеличение времени выполнения и лимита памяти
set_time_limit(300); // Увеличиваем лимит времени выполнения до 300 секунд
ini_set('memory_limit', '512M'); // Увеличиваем лимит памяти до 512 МБ

try {
    // Подключение к базе данных
    $pdo = getDbConnection();

    // Запрос всех пользователей с завершенными шагами
    $stmt = $pdo->query("SELECT DISTINCT id_usertg, username FROM users WHERE id_usertg IN (SELECT id_usertg FROM steps WHERE step = 'Завершено' AND status = 3)");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Создание нового объекта Spreadsheet
    $spreadsheet = new Spreadsheet();

    // Создание основной страницы
    $mainSheet = $spreadsheet->getActiveSheet();
    $mainSheet->setTitle('Пользователи');

    // Запись заголовков
    $mainSheet->setCellValue('A1', 'Пользователь');
    $mainSheet->setCellValue('B1', 'Ссылка на страницу');

    // Форматирование заголовков
    $headerStyle = [
        'font' => ['bold' => true],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFFFE0B2']]
    ];
    $mainSheet->getStyle('A1:B1')->applyFromArray($headerStyle);
    $mainSheet->getRowDimension('1')->setRowHeight(20);

    $rowIndex = 2;

    foreach ($users as $user) {
        $username = $user['username'];
        $userId = $user['id_usertg'];

        // Очистка имени пользователя для использования в названии листа
        $safeUsername = preg_replace('/[\\\\\\/\\?\\*\\[\\]:]/', '_', $username);

        // Запись данных в основную таблицу
        $mainSheet->setCellValue('A' . $rowIndex, $username);
        $mainSheet->setCellValue('B' . $rowIndex, "Ссылка на страницу $username");
        $mainSheet->getCell('B' . $rowIndex)->getHyperlink()->setUrl("sheet://$safeUsername");

        // Создание страницы для пользователя
        $userSheet = $spreadsheet->createSheet();
        $userSheet->setTitle($safeUsername);

        // Запись заголовков
        $userSheet->setCellValue('A1', 'Название товара');
        $userSheet->setCellValue('B1', 'Цена одной выплаты');
        $userSheet->setCellValue('C1', 'Выгода');
        $userSheet->setCellValue('D1', 'Сумма выплат');

        // Форматирование заголовков
        $userSheet->getStyle('A1:D1')->applyFromArray($headerStyle);
        $userSheet->getRowDimension('1')->setRowHeight(20);

        // Запрос товаров для пользователя
        $stmt = $pdo->prepare("
            SELECT p.name, p.market_price, p.your_price, 
                   (p.market_price - p.your_price) AS benefit, 
                   (p.market_price - p.your_price) AS total_benefit
            FROM products p
            JOIN steps s ON p.id = s.id_product
            WHERE s.id_usertg = :userId
              AND s.step = 'Завершено' AND s.status = 3
        ");
        $stmt->execute(['userId' => $userId]);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $userRowIndex = 2;
        $userTotal = 0;

        foreach ($products as $product) {
            $userSheet->setCellValue('A' . $userRowIndex, $product['name']);
            $userSheet->setCellValue('B' . $userRowIndex, $product['your_price']);
            $userSheet->setCellValue('C' . $userRowIndex, $product['benefit']);
            $userSheet->setCellValue('D' . $userRowIndex, $product['total_benefit']);

            // Форматирование содержимого таблицы
            $contentStyle = [
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
            ];
            $userSheet->getStyle('A' . $userRowIndex . ':D' . $userRowIndex)->applyFromArray($contentStyle);
            $userSheet->getRowDimension($userRowIndex)->setRowHeight(20);

            // Установка денежного типа ячейки
            $userSheet->getStyle('B' . $userRowIndex)
                      ->getNumberFormat()
                      ->setFormatCode('#,##0 ₽');
            $userSheet->getStyle('C' . $userRowIndex)
                      ->getNumberFormat()
                      ->setFormatCode('#,##0 ₽');
            $userSheet->getStyle('D' . $userRowIndex)
                      ->getNumberFormat()
                      ->setFormatCode('#,##0 ₽');

            $userTotal += $product['total_benefit'];
            $userRowIndex++;
        }

        // Запись общей суммы под таблицей
        $userSheet->setCellValue('C' . $userRowIndex, 'Итого');
        $userSheet->setCellValue('D' . $userRowIndex, $userTotal);

        // Форматирование итогов
        $totalStyle = [
            'font' => ['bold' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFB2FFB2']]
        ];
        $userSheet->getStyle('C' . $userRowIndex . ':D' . $userRowIndex)->applyFromArray($totalStyle);

        // Установка денежного типа ячейки для итогов
        $userSheet->getStyle('D' . $userRowIndex)
                  ->getNumberFormat()
                  ->setFormatCode('#,##0 ₽');

        // Установка автоширины для столбцов
        foreach (range('A', 'D') as $columnID) {
            $userSheet->getColumnDimension($columnID)->setAutoSize(true);
        }

        $rowIndex++;
    }

    // Установка автоширины для столбцов основной страницы
    foreach (range('A', 'B') as $columnID) {
        $mainSheet->getColumnDimension($columnID)->setAutoSize(true);
    }

    // Сохранение Excel-файла во временную директорию
    $filename = 'UserReport.xlsx';
    $temp_file = sys_get_temp_dir() . '/' . $filename;

    $writer = new Xlsx($spreadsheet);
    $writer->save($temp_file);

    // Отправка файла клиенту
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . filesize($temp_file));
    
    ob_clean();
    flush();
    readfile($temp_file);

    unlink($temp_file);

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Ошибка при получении данных из базы: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Ошибка при создании Excel-файла: ' . $e->getMessage()
    ]);
}
?>
