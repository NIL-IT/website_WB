<?php
require 'vendor/autoload.php';
include 'db.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

try {
    $pdo = getDbConnection();

    // Получаем последнюю запись excel_steps_count
    $stmtLast = $pdo->query("SELECT * FROM excel_steps_count ORDER BY created_at DESC LIMIT 1");
    $lastRow = $stmtLast->fetch(PDO::FETCH_ASSOC);

    $needNewExcel = true;
    $stepIds = [];
    $newExcelStepsCount = 0;

    if ($lastRow && isset($lastRow['pay'])) {
        if ($lastRow['pay'] === 'f' || $lastRow['pay'] === false || $lastRow['pay'] === 0) {
            // pay = false, используем старый массив step_ids
            $needNewExcel = false;
            $stepIds = json_decode($lastRow['step_ids'], true);
            if (!is_array($stepIds)) $stepIds = [];
        }
    }

    if ($needNewExcel) {
        // pay = true или нет записей, формируем новый массив id steps
        $stmt = $pdo->query("SELECT * FROM steps WHERE in_excel = true");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stepIds = array_column($rows, 'id');
        $newExcelStepsCount = count(array_unique($stepIds));
        $stepIdsJson = json_encode(array_values($stepIds), JSON_UNESCAPED_UNICODE);

        // Вставляем новую строку excel_steps_count с pay = false
        $stmtSave = $pdo->prepare("INSERT INTO excel_steps_count (created_at, steps_count, step_ids, pay) VALUES (NOW(), ?, ?, false)");
        $stmtSave->execute([$newExcelStepsCount, $stepIdsJson]);
    }

    // Получаем данные steps по массиву id
    if (!empty($stepIds)) {
        $inQuery = implode(',', array_fill(0, count($stepIds), '?'));
        $stmtSteps = $pdo->prepare("SELECT * FROM steps WHERE id IN ($inQuery)");
        $stmtSteps->execute($stepIds);
        $rows = $stmtSteps->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $rows = [];
    }

    // Создаём Excel
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle("Отчёт");

    // Стили для заголовков
    $headerStyle = [
        'font' => ['bold' => true, 'size' => 13],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFD9D9D9']]
    ];

    $contentStyle = [
        'font' => ['size' => 12],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
        // fill убран, чтобы не перекрывать индивидуальные цвета
    ];
    // Цвета для отдельных ячеек
    $sumColor = 'FFFFEBEE'; // еле красный
    $sbpColor = 'FFFFF9C4'; // еле желтый
    $grayColor = 'FFF5F5F5'; // еле серый

    // Заголовки
    $headers = [
        'A1' => 'Фамилия',
        'B1' => 'Имя',
        'C1' => 'Отчество',
        'D1' => 'Правовой статус',
        'E1' => 'ИНН',
        'F1' => 'Телефон',
        'G1' => 'Товар',
        'H1' => 'Сумма',
        'I1' => 'Номер карты',
        'J1' => 'Номер телефона для СБП',
        'K1' => 'Номер банка для СБП',
        'L1' => 'Статус',
        'M1' => 'Дата',
    ];

    foreach ($headers as $cell => $text) {
        $sheet->setCellValue($cell, $text);
    }

    $sheet->getStyle('A1:M1')->applyFromArray($headerStyle);
    // Цвета для шапки только для нужных колонок, остальные явно белые
    $sheet->getStyle('H1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($sumColor); // сумма
    $sheet->getStyle('J1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($sbpColor); // телефон для СБП
    $sheet->getStyle('K1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($sbpColor); // id банка для СБП
    $sheet->getStyle('D1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($grayColor); // правовой статус
    $sheet->getStyle('E1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($grayColor); // ИНН
    // Все остальные явно белые
    foreach(['A','B','C','F','G','I','L','M'] as $col) {
        $sheet->getStyle($col.'1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFFFFFFF');
    }

    $sheet->getRowDimension('1')->setRowHeight(20);

    $rowIndex = 2;
    foreach ($rows as $row) {
        // ФИО
        $fio = isset($row['cardholder']) ? preg_split('/\s+/', trim($row['cardholder'])) : ['','',''];
        $surname = $fio[0] ?? '';
        $name = $fio[1] ?? '';
        $patronymic = $fio[2] ?? '';
        // Правовой статус
        $status = 'физическое лицо';
        // ИНН
        $inn = '';
        // Телефон
        $phone = $row['phone'] ?? '';
        // Товар (название)
        $productName = '';
        $sum = '';
        $id_product = $row['id_product'] ?? null;
        if ($id_product) {
            $stmtProd = $pdo->prepare("SELECT market_price, your_price, name FROM products WHERE id = ?");
            $stmtProd->execute([$id_product]);
            $prod = $stmtProd->fetch(PDO::FETCH_ASSOC);
            if ($prod) {
                $productName = $prod['name'] ?? '';
                if (empty($row['modified_payment'])) {
                    $sum = $prod['market_price'] - $prod['your_price'];
                } else {
                    $sum = $row['modified_payment'];}
            }
        }
        // Номер карты (как строка)
        $cardnumber = isset($row['cardnumber']) ? (string)$row['cardnumber'] : '';
        // Телефон для СБП
        $sbp_phone = $phone;
        // ID банка для СБП (как строка)
        $id_bank = '';
        if (!empty($row['bankname'])) {
            $stmtBank = $pdo->prepare("SELECT id_bank FROM banks WHERE bankname = ?");
            $stmtBank->execute([$row['bankname']]);
            $bank = $stmtBank->fetch(PDO::FETCH_ASSOC);
            if ($bank) {
                $id_bank = (string)$bank['id_bank'];
            }
        }
        // Статус
        $status_col = '';
        if (isset($row['status'])) {
            if ($row['status'] == 1 || $row['status'] == 2) {
                $status_col = 'подтверждён/не оплачен';
            } else {
                $status_col = $row['status'];
            }
        }
        // Дата
        $date = $row['completed_at'] ?? '';

        $sheet->setCellValue('A'.$rowIndex, $surname);
        $sheet->setCellValue('B'.$rowIndex, $name);
        $sheet->setCellValue('C'.$rowIndex, $patronymic);
        $sheet->setCellValue('D'.$rowIndex, $status);
        $sheet->setCellValue('E'.$rowIndex, $inn);
        $sheet->setCellValue('F'.$rowIndex, $phone);
        $sheet->setCellValue('G'.$rowIndex, $productName);
        $sheet->setCellValue('H'.$rowIndex, $sum);
        $sheet->setCellValueExplicit('I'.$rowIndex, $cardnumber, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
        $sheet->setCellValue('J'.$rowIndex, $sbp_phone);
        $sheet->setCellValueExplicit('K'.$rowIndex, $id_bank, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
        $sheet->setCellValue('L'.$rowIndex, $status_col);
        $sheet->setCellValue('M'.$rowIndex, $date);
        $sheet->getStyle('A'.$rowIndex.':M'.$rowIndex)->applyFromArray($contentStyle);
        // Цвет для суммы
        $sheet->getStyle('H'.$rowIndex)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($sumColor);
        // Цвет для телефона для СБП и id банка для СБП
        $sheet->getStyle('J'.$rowIndex)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($sbpColor);
        $sheet->getStyle('K'.$rowIndex)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($sbpColor);
        // Цвет для правового статуса и ИНН
        $sheet->getStyle('D'.$rowIndex)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($grayColor);
        $sheet->getStyle('E'.$rowIndex)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($grayColor);

        $rowIndex++;
    }

    // Автоматическая ширина столбцов
    foreach (range('A', 'M') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }

    // Сохранение файла
    $filename = "Excel_Payment(" . date('Y-m-d') . ").xlsx";
    $temp_file = sys_get_temp_dir() . '/' . $filename;

    $writer = new Xlsx($spreadsheet);
    $writer->save($temp_file);

    // Если был создан новый excel (pay = true), то обновляем in_excel = false для этих steps
    if ($needNewExcel && !empty($stepIds)) {
        $inQuery = implode(',', array_fill(0, count($stepIds), '?'));
        $stmtUpdate = $pdo->prepare("UPDATE steps SET in_excel = false WHERE id IN ($inQuery)");
        $stmtUpdate->execute($stepIds);
    }

    // Отдаём на скачивание
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . filesize($temp_file));

    ob_clean();
    flush();
    readfile($temp_file);

    unlink($temp_file);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Ошибка при создании Excel-файла: ' . $e->getMessage()
    ]);
}
