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

    $stmt = $pdo->query("SELECT DISTINCT id_usertg, username FROM users WHERE id_usertg IN (SELECT id_usertg FROM steps WHERE step = 'Завершено' AND status = 3)");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $spreadsheet = new Spreadsheet();
    $mainSheet = $spreadsheet->getActiveSheet();
    $mainSheet->setTitle('Пользователи');

    $mainSheet->setCellValue('A1', 'Пользователь');
    $mainSheet->setCellValue('B1', 'Ссылка на страницу');

    $rowIndex = 2;

    foreach ($users as $user) {
        $username = $user['username'];
        $userId = $user['id_usertg'];
        $safeUsername = preg_replace('/[\\\/\?\*\[\]:]/', '_', $username);
        $safeUsername = mb_substr($safeUsername, 0, 31);

        $mainSheet->setCellValue('A' . $rowIndex, $username);
        $mainSheet->setCellValue('B' . $rowIndex, "Лист: $safeUsername");

        $userSheet = $spreadsheet->createSheet();
        $userSheet->setTitle($safeUsername);

        $userSheet->setCellValue('A1', 'Название товара');
        $userSheet->setCellValue('B1', 'Цена');
        $userSheet->setCellValue('C1', 'Выгода');
        $userSheet->setCellValue('D1', 'Сумма выплат');

        $stmt = $pdo->prepare("SELECT p.name, p.market_price, p.your_price, (p.market_price - p.your_price) AS benefit FROM products p JOIN steps s ON p.id = s.id_product WHERE s.id_usertg = :userId AND s.step = 'Завершено' AND s.status = 3");
        $stmt->execute(['userId' => $userId]);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $userRowIndex = 2;
        $userTotal = 0;

        foreach ($products as $product) {
            $userSheet->setCellValue('A' . $userRowIndex, $product['name']);
            $userSheet->setCellValue('B' . $userRowIndex, $product['your_price']);
            $userSheet->setCellValue('C' . $userRowIndex, $product['benefit']);
            $userSheet->setCellValue('D' . $userRowIndex, $product['benefit']);
            $userTotal += $product['benefit'];
            $userRowIndex++;
        }

        $userSheet->setCellValue('C' . $userRowIndex, 'Итого');
        $userSheet->setCellValue('D' . $userRowIndex, $userTotal);

        $rowIndex++;
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
