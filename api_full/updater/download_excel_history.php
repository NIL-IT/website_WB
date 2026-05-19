<?php
require 'vendor/autoload.php';
include 'db.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

$pdo = getDbConnection();

// Получаем список прошлых excel_steps_count
$stmt = $pdo->query("SELECT * FROM excel_steps_count ORDER BY id DESC");
$excelFiles = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (isset($_GET['id'])) {
    $excelId = intval($_GET['id']);
    $stmt = $pdo->prepare("SELECT * FROM excel_steps_count WHERE id = ?");
    $stmt->execute([$excelId]);
    $excelRow = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$excelRow) {
        die('Excel с таким id не найден');
    }
    $stepIds = json_decode($excelRow['step_ids'], true);
    if (!is_array($stepIds)) $stepIds = [];
    if (empty($stepIds)) {
        die('Нет данных для формирования Excel-файла');
    }
    // Получаем данные steps по массиву id
    $inQuery = implode(',', array_fill(0, count($stepIds), '?'));
    $stmtSteps = $pdo->prepare("SELECT * FROM steps WHERE id IN ($inQuery)");
    $stmtSteps->execute($stepIds);
    $rows = $stmtSteps->fetchAll(PDO::FETCH_ASSOC);

    // --- Код генерации Excel ---
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle("Отчёт");
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
    ];
    $sumColor = 'FFFFEBEE';
    $sbpColor = 'FFFFF9C4';
    $grayColor = 'FFF5F5F5';
    $greenColor = 'FFB9F6CA';
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
        'N1' => 'Ник менеджера'
    ];
    foreach ($headers as $cell => $text) {
        $sheet->setCellValue($cell, $text);
    }
    $sheet->getStyle('A1:N1')->applyFromArray($headerStyle);
    $sheet->getStyle('H1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($sumColor);
    $sheet->getStyle('J1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($sbpColor);
    $sheet->getStyle('K1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($sbpColor);
    $sheet->getStyle('D1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($grayColor);
    $sheet->getStyle('E1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($grayColor);
    foreach(['A','B','C','F','G','I','L','M','N'] as $col) {
        $sheet->getStyle($col.'1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFFFFFFF');
    }
    $sheet->getRowDimension('1')->setRowHeight(20);
    $rowIndex = 2;
    foreach ($rows as $row) {
        $fio = isset($row['cardholder']) ? preg_split('/\s+/', trim($row['cardholder'])) : ['','',''];
        $surname = $fio[0] ?? '';
        $name = $fio[1] ?? '';
        $patronymic = $fio[2] ?? '';
        $status = 'физическое лицо';
        $inn = '';
        $phone = $row['phone'] ?? '';
        $productName = '';
        $tg_nick_manager = '';
        $sum = '';
        $id_product = $row['id_product'] ?? null;
        if ($id_product) {
            $stmtProd = $pdo->prepare("SELECT market_price, your_price, name, tg_nick_manager FROM products WHERE id = ?");
            $stmtProd->execute([$id_product]);
            $prod = $stmtProd->fetch(PDO::FETCH_ASSOC);
            if ($prod) {
                $productName = $prod['name'] ?? '';
                $tg_nick_manager = $prod['tg_nick_manager'] ?? '';
                if (empty($row['modified_payment'])) {
                    $sum = $prod['market_price'] - $prod['your_price'];
                } else {
                    $sum = $row['modified_payment'];
                }
            }
        }
        $cardnumber = isset($row['cardnumber']) ? (string)$row['cardnumber'] : '';
        $sbp_phone = $phone;
        $id_bank = '';
        if (!empty($row['bankname'])) {
            $stmtBank = $pdo->prepare("SELECT id_bank FROM banks WHERE bankname = ?");
            $stmtBank->execute([$row['bankname']]);
            $bank = $stmtBank->fetch(PDO::FETCH_ASSOC);
            if ($bank) {
                $id_bank = (string)$bank['id_bank'];
            }
        }
        $status_col = '';
        $status_cell_color = null;
        if (isset($row['status'])) {
            if ($row['status'] == 1 || $row['status'] == 2) {
                $status_col = 'подтверждён/не оплачен';
            } elseif ($row['status'] == 3) {
                $status_col = 'подтверждён/оплачен';
                $status_cell_color = $greenColor;
            } else {
                $status_col = $row['status'];
            }
        }
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
        $sheet->setCellValue('N'.$rowIndex, $tg_nick_manager);
        $sheet->getStyle('A'.$rowIndex.':N'.$rowIndex)->applyFromArray($contentStyle);
        $sheet->getStyle('H'.$rowIndex)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($sumColor);
        $sheet->getStyle('J'.$rowIndex)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($sbpColor);
        $sheet->getStyle('K'.$rowIndex)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($sbpColor);
        $sheet->getStyle('D'.$rowIndex)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($grayColor);
        $sheet->getStyle('E'.$rowIndex)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($grayColor);
        if ($status_cell_color || (isset($row['status']) && $row['status'] == 3)) {
            $sheet->getStyle('A'.$rowIndex.':N'.$rowIndex)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($greenColor);
        }
        $rowIndex++;
    }
    foreach (range('A', 'N') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }
    $filename = "Excel_Payment_{$excelId}_" . date('Y-m-d') . ".xlsx";
    $temp_file = sys_get_temp_dir() . '/' . $filename;
    $writer = new Xlsx($spreadsheet);
    $writer->save($temp_file);
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . filesize($temp_file));
    ob_clean();
    flush();
    readfile($temp_file);
    unlink($temp_file);
    exit;
}
?><!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Выгрузка прошлых Excel-файлов</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #eee; }
        tr:hover { background: #f5f5f5; }
        .btn { padding: 6px 14px; background: #1976d2; color: #fff; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; }
        .btn:hover { background: #1565c0; }
    </style>
</head>
<body>
    <h2>Выгрузка прошлых Excel-файлов</h2>
    <table>
        <tr>
            <th>ID</th>
            <th>Дата создания</th>
            <th>Кол-во steps</th>
            <th>Pay</th>
            <th>Выгрузить</th>
        </tr>
        <?php foreach ($excelFiles as $excel): ?>
        <tr>
            <td><?= htmlspecialchars($excel['id']) ?></td>
            <td><?= htmlspecialchars($excel['created_at']) ?></td>
            <td><?= htmlspecialchars($excel['steps_count']) ?></td>
            <td><?= $excel['pay'] ? 'Да' : 'Нет' ?></td>
            <td><a class="btn" href="?id=<?= $excel['id'] ?>">Скачать Excel</a></td>
        </tr>
        <?php endforeach; ?>
    </table>
</body>
</html>
