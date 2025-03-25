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
    $stmt = $pdo->query("SELECT DISTINCT u.id_usertg, u.username FROM users u
                          JOIN steps s ON u.id_usertg = s.id_usertg
                          WHERE s.step = 'Завершено' AND s.status = 3");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $spreadsheet = new Spreadsheet();
    $mainSheet = $spreadsheet->getActiveSheet();
    $mainSheet->setTitle('Пользователи');
    
    $mainSheet->setCellValue('A1', 'Пользователь');
    $mainSheet->setCellValue('B1', 'Ссылка на страницу');
    
    $headerStyle = [
        'font' => ['bold' => true],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFFFE0B2']]
    ];
    $mainSheet->getStyle('A1:B1')->applyFromArray($headerStyle);
    $rowIndex = 2;

    foreach ($users as $user) {
        $username = $user['username'];
        $userId = $user['id_usertg'];
        $safeUsername = preg_replace('/[\\\/\?\*\[\]:]/', '_', $username);

        $mainSheet->setCellValue('A' . $rowIndex, $username);
        $mainSheet->setCellValue('B' . $rowIndex, "Ссылка на $username");
        $mainSheet->getCell('B' . $rowIndex)->getHyperlink()->setUrl("sheet://$safeUsername");

        $userSheet = $spreadsheet->createSheet();
        $userSheet->setTitle($safeUsername);
        
        $userSheet->setCellValue('A1', 'Название товара');
        $userSheet->setCellValue('B1', 'Цена');
        $userSheet->setCellValue('C1', 'Выгода');
        $userSheet->setCellValue('D1', 'Сумма выплат');
        $userSheet->getStyle('A1:D1')->applyFromArray($headerStyle);
        
        $stmt = $pdo->prepare("SELECT p.name, p.market_price, p.your_price, 
                                      (p.market_price - p.your_price) AS benefit, 
                                      (p.market_price - p.your_price) AS total_benefit
                               FROM products p
                               JOIN steps s ON p.id = s.id_product
                               WHERE s.id_usertg = :userId AND s.step = 'Завершено' AND s.status = 3");
        $stmt->execute([':userId' => $userId]);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $userRowIndex = 2;
        $userTotal = 0;

        foreach ($products as $product) {
            $userSheet->setCellValue('A' . $userRowIndex, $product['name']);
            $userSheet->setCellValue('B' . $userRowIndex, $product['your_price']);
            $userSheet->setCellValue('C' . $userRowIndex, $product['benefit']);
            $userSheet->setCellValue('D' . $userRowIndex, $product['total_benefit']);

            $userSheet->getStyle('A' . $userRowIndex . ':D' . $userRowIndex)->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
            ]);
            
            $userSheet->getStyle('B' . $userRowIndex . ':D' . $userRowIndex)
                      ->getNumberFormat()
                      ->setFormatCode('#,##0 ₽');

            $userTotal += $product['total_benefit'];
            $userRowIndex++;
        }

        $userSheet->setCellValue('C' . $userRowIndex, 'Итого');
        $userSheet->setCellValue('D' . $userRowIndex, $userTotal);
        $userSheet->getStyle('C' . $userRowIndex . ':D' . $userRowIndex)->applyFromArray([
            'font' => ['bold' => true],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFB2FFB2']]
        ]);
        $userSheet->getStyle('D' . $userRowIndex)
                  ->getNumberFormat()
                  ->setFormatCode('#,##0 ₽');
        
        $rowIndex++;
    }
    
    foreach (range('A', 'B') as $columnID) {
        $mainSheet->getColumnDimension($columnID)->setAutoSize(true);
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
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка: ' . $e->getMessage()]);
}
?>
