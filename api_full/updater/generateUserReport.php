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

try {
    // Подключение к базе данных
    $pdo = getDbConnection();

    // Создание нового объекта Spreadsheet
    $spreadsheet = new Spreadsheet();

    // Запрос всех менеджеров из таблицы products
    $stmt = $pdo->query("SELECT DISTINCT tg_nick_manager FROM products WHERE tg_nick_manager IS NOT NULL AND tg_nick_manager != ''");
    $managers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Стили для таблиц
    $headerStyle = [
        'font' => ['bold' => true],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFFFE0B2']]
    ];
    $contentStyle = [
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
    ];

    // Создание массива для хранения сумм выплат по менеджерам
    $managerPayments = [];

    foreach ($managers as $manager) {
        $managerNick = $manager['tg_nick_manager'];

        // Создание нового листа для каждого менеджера
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle($managerNick);

        // Запись заголовков
        $sheet->setCellValue('A1', 'Пользователь');
        $sheet->setCellValue('B1', 'Время завершения финального шага');
        $sheet->setCellValue('C1', 'Время выплаты чека');
        $sheet->setCellValue('D1', 'Выплата');

        $sheet->getStyle('A1:D1')->applyFromArray($headerStyle);
        $sheet->getRowDimension('1')->setRowHeight(20);

        // Запрос данных для отчёта
        $stmt = $pdo->prepare("
            SELECT 
                u.username AS user,
                s.completed_at,
                s.receipt_timestamp,
                COALESCE(s.modified_payment, p.market_price - p.your_price) AS payment,
                s.updated_at,
                s.modified_payment
            FROM steps s
            INNER JOIN products p ON s.id_product = p.id
            INNER JOIN users u ON s.id_usertg = u.id_usertg -- Замените 'u.id' на 'u.user_id', если это правильное имя колонки
            WHERE p.tg_nick_manager = :managerNick AND s.step = 'Завершено' AND s.status = 3
            ORDER BY s.updated_at DESC
        ");
        $stmt->execute(['managerNick' => $managerNick]);
        $steps = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $rowIndex = 2;
        $totalSpecifiedPayment = 0; // Сумма указанных выплат
        $totalCalculatedPayment = 0; // Сумма посчитанных выплат
        foreach ($steps as $step) {
            $sheet->setCellValue('A' . $rowIndex, $step['user']);
            $sheet->setCellValue('B' . $rowIndex, $step['completed_at']);
            $sheet->setCellValue('C' . $rowIndex, $step['receipt_timestamp']);
            $sheet->setCellValue('D' . $rowIndex, $step['payment']);

            // Применение стилей для ячеек на основе источника значения
            if (!is_null($step['modified_payment'])) {
                $sheet->getStyle('D' . $rowIndex)->getFill()->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFBBDEFB'); // Синий цвет
                $totalSpecifiedPayment += $step['payment']; // Указанная выплата
            } else {
                $sheet->getStyle('D' . $rowIndex)->getFill()->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFFFCDD2'); // Красный цвет
                $totalCalculatedPayment += $step['payment']; // Посчитанная выплата
            }

            $sheet->getStyle('A' . $rowIndex . ':D' . $rowIndex)->applyFromArray($contentStyle);
            $sheet->getRowDimension($rowIndex)->setRowHeight(20);

            $rowIndex++;
        }

        // Сохраняем суммы выплат для текущего менеджера
        $managerPayments[$managerNick] = [
            'specified' => $totalSpecifiedPayment,
            'calculated' => $totalCalculatedPayment
        ];

        // Установка ширины для столбцов
        foreach (range('A', 'D') as $columnID) {
            $sheet->getColumnDimension($columnID)->setAutoSize(true);
        }
    }

    // Добавление итоговой страницы с суммами выплат
    $summarySheet = $spreadsheet->createSheet();
    $summarySheet->setTitle('Суммы выплат');

    // Запись заголовков
    $summarySheet->setCellValue('A1', 'Менеджер');
    $summarySheet->setCellValue('B1', 'Указанные выплаты');
    $summarySheet->setCellValue('C1', 'Посчитанные выплаты');
    $summarySheet->setCellValue('D1', 'Общая сумма');
    $summarySheet->getStyle('A1:D1')->applyFromArray($headerStyle);
    $summarySheet->getRowDimension('1')->setRowHeight(20);

    // Запись данных
    $rowIndex = 2;
    $totalSpecifiedAll = 0; // Общая сумма указанных выплат
    $totalCalculatedAll = 0; // Общая сумма посчитанных выплат
    foreach ($managerPayments as $managerNick => $payments) {
        $totalSpecifiedAll += $payments['specified'];
        $totalCalculatedAll += $payments['calculated'];
        $totalAll = $payments['specified'] + $payments['calculated'];

        $summarySheet->setCellValue('A' . $rowIndex, $managerNick);
        $summarySheet->setCellValue('B' . $rowIndex, $payments['specified']);
        $summarySheet->setCellValue('C' . $rowIndex, $payments['calculated']);
        $summarySheet->setCellValue('D' . $rowIndex, $totalAll);

        $summarySheet->getStyle('A' . $rowIndex . ':D' . $rowIndex)->applyFromArray($contentStyle);
        $summarySheet->getRowDimension($rowIndex)->setRowHeight(20);

        $rowIndex++;
    }

    // Запись общей суммы для всех менеджеров
    $summarySheet->setCellValue('A' . $rowIndex, 'Итого');
    $summarySheet->setCellValue('B' . $rowIndex, $totalSpecifiedAll);
    $summarySheet->setCellValue('C' . $rowIndex, $totalCalculatedAll);
    $summarySheet->setCellValue('D' . $rowIndex, $totalSpecifiedAll + $totalCalculatedAll);
    $summarySheet->getStyle('A' . $rowIndex . ':D' . $rowIndex)->applyFromArray($headerStyle);
    $summarySheet->getRowDimension($rowIndex)->setRowHeight(20);

    // Установка ширины для столбцов
    foreach (range('A', 'D') as $columnID) {
        $summarySheet->getColumnDimension($columnID)->setAutoSize(true);
    }

    // Удаление первого пустого листа
    $spreadsheet->removeSheetByIndex(0);

    // Сохранение Excel-файла во временную директорию
    $filename = 'UserReport.xlsx';
    $temp_file = sys_get_temp_dir() . '/' . $filename;

    $writer = new Xlsx($spreadsheet);
    $writer->save($temp_file);

    // Отправка файла клиенту
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . filesize($temp_file));

    ob_clean(); // Очистка буфера вывода
    flush(); // Сброс системы вывода
    readfile($temp_file);

    // Удаление временного файла
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