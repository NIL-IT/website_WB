<?php
include 'db.php';
header('Content-Type: application/json');

require 'vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

set_time_limit(300);
ini_set('memory_limit', '512M');

try {
    $pdo = getDbConnection();

    $stmt = $pdo->query("SELECT DISTINCT id_usertg, username FROM users WHERE id_usertg IN (SELECT id_usertg FROM steps WHERE step = 'Завершено' AND status = 3) LIMIT 1000");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $spreadsheet = new Spreadsheet();
    $mainSheet = $spreadsheet->getActiveSheet();
    $mainSheet->setTitle('1');

    $mainSheet->setCellValue('A1', 'Пользователь');
    $mainSheet->setCellValue('B1', 'Ссылка на страницу');

    $headerStyle = [
        'font' => ['bold' => true],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFFFE0B2']]
    ];
    $mainSheet->getStyle('A1:B1')->applyFromArray($headerStyle);
    $mainSheet->getRowDimension('1')->setRowHeight(20);

    $rowIndex = 2;
    $sheetIndex = 2;

    foreach ($users as $user) {
        $username = $user['username'];
        $userId = $user['id_usertg'];
        $sheetName = (string) $sheetIndex;

        $mainSheet->setCellValue('A' . $rowIndex, $username);
        $mainSheet->setCellValue('B' . $rowIndex, "Ссылка на страницу");
        $mainSheet->getCell('B' . $rowIndex)->getHyperlink()->setUrl("sheet://$sheetName");

        $userSheet = $spreadsheet->createSheet();
        $userSheet->setTitle($sheetName);

        $userSheet->setCellValue('A1', 'Название товара');
        $userSheet->setCellValue('B1', 'Цена одной выплаты');
        $userSheet->setCellValue('C1', 'Выгода');
        $userSheet->setCellValue('D1', 'Сумма выплат');

        $userSheet->getStyle('A1:D1')->applyFromArray($headerStyle);
        $userSheet->getRowDimension('1')->setRowHeight(20);

        $stmt = $pdo->prepare("SELECT p.name, p.market_price, p.your_price, (p.market_price - p.your_price) AS benefit, (p.market_price - p.your_price) AS total_benefit FROM products p JOIN steps s ON p.id = s.id_product WHERE s.id_usertg = :userId AND s.step = 'Завершено' AND s.status = 3");
        $stmt->execute(['userId' => $userId]);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $userRowIndex = 2;
        $userTotal = 0;

        foreach ($products as $product) {
            $userSheet->setCellValue('A' . $userRowIndex, $product['name']);
            $userSheet->setCellValue('B' . $userRowIndex, $product['your_price']);
            $userSheet->setCellValue('C' . $userRowIndex, $product['benefit']);
            $userSheet->setCellValue('D' . $userRowIndex, $product['total_benefit']);
            $userTotal += $product['total_benefit'];
            $userRowIndex++;
        }

        $userSheet->setCellValue('C' . $userRowIndex, 'Итого');
        $userSheet->setCellValue('D' . $userRowIndex, $userTotal);
        
        $rowIndex++;
        $sheetIndex++;
    }

    $filename = 'UserReport.xlsx';
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

} catch (PDOException $e) {
    echo json_encode([ 'status' => 'error', 'message' => 'Ошибка при получении данных из базы: ' . $e->getMessage() ]);
} catch (Exception $e) {
    echo json_encode([ 'status' => 'error', 'message' => 'Ошибка при создании Excel-файла: ' . $e->getMessage() ]);
}
?>