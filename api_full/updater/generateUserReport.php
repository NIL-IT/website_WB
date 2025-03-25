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

// Увеличение лимитов
set_time_limit(300);
ini_set('memory_limit', '512M');

try {
    $pdo = getDbConnection();

    // Получаем пользователей и их товары одним запросом
    $stmt = $pdo->query("
        SELECT u.id_usertg, u.username, 
               p.name AS product_name, 
               p.market_price, 
               p.your_price, 
               (p.market_price - p.your_price) AS benefit
        FROM users u
        JOIN steps s ON u.id_usertg = s.id_usertg
        JOIN products p ON s.id_product = p.id
        WHERE s.step = 'Завершено' AND s.status = 3
        ORDER BY u.id_usertg
    ");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$data) {
        echo json_encode(['status' => 'error', 'message' => 'Нет данных для экспорта']);
        exit;
    }

    $spreadsheet = new Spreadsheet();
    $mainSheet = $spreadsheet->getActiveSheet();
    $mainSheet->setTitle('Пользователи');

    // Заголовки
    $mainSheet->setCellValue('A1', 'Пользователь');
    $mainSheet->setCellValue('B1', 'Ссылка на страницу');

    $headerStyle = [
        'font' => ['bold' => true],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFFFE0B2']]
    ];
    $mainSheet->getStyle('A1:B1')->applyFromArray($headerStyle);

    $users = [];
    $rowIndex = 2;

    foreach ($data as $row) {
        $userId = $row['id_usertg'];
        $username = $row['username'];
        $safeUsername = preg_replace('/[\\\\\\/\\?\\*\\[\\]:]/', '_', $username);

        if (!isset($users[$userId])) {
            // Добавляем пользователя в основной лист
            $mainSheet->setCellValue("A$rowIndex", $username);
            $mainSheet->setCellValue("B$rowIndex", "Лист $username");
            $users[$userId] = [
                'sheet' => $spreadsheet->createSheet(),
                'row' => 2,
                'total' => 0
            ];
            $users[$userId]['sheet']->setTitle($safeUsername);
            $users[$userId]['sheet']->setCellValue('A1', 'Название товара')
                                   ->setCellValue('B1', 'Цена')
                                   ->setCellValue('C1', 'Выгода');

            $users[$userId]['sheet']->getStyle('A1:C1')->applyFromArray($headerStyle);
            $rowIndex++;
        }

        $sheet = $users[$userId]['sheet'];
        $userRow = $users[$userId]['row'];
        $sheet->setCellValue("A$userRow", $row['product_name']);
        $sheet->setCellValue("B$userRow", $row['your_price']);
        $sheet->setCellValue("C$userRow", $row['benefit']);
        $users[$userId]['total'] += $row['benefit'];
        $users[$userId]['row']++;
    }

    foreach ($users as $user) {
        $totalRow = $user['row'];
        $user['sheet']->setCellValue("B$totalRow", 'Итого:');
        $user['sheet']->setCellValue("C$totalRow", $user['total']);
        $user['sheet']->getStyle("B$totalRow:C$totalRow")->applyFromArray(['font' => ['bold' => true]]);
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
