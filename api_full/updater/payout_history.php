<?php
include 'db.php';
require 'vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

header('Content-Type: application/json');

function isAdmin($id_usertg, $pdo) {
    $stmt = $pdo->prepare("SELECT status FROM users WHERE id_usertg = ?");
    $stmt->execute([$id_usertg]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row && $row['status'] === 'admin';
}

try {
    // Получаем данные из тела запроса
    $input = json_decode(file_get_contents("php://input"), true);
    $id_usertg = $input['id_usertg'] ?? null;
    if (!$id_usertg || !isAdmin($id_usertg, $pdo = getDbConnection())) {
        echo json_encode(['status' => 'error', 'message' => 'Нет доступа']);
        exit;
    }
    $pdo = getDbConnection();

    // Стили
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
    $totalStyle = [
        'font' => ['bold' => true],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFB2FFB2']]
    ];

    $spreadsheet = new Spreadsheet();

    // Получаем всех менеджеров
    $managers = $pdo->query("SELECT id, manager_id, manager_username FROM managers")->fetchAll(PDO::FETCH_ASSOC);

    $summarySheet = $spreadsheet->createSheet();
    $summarySheet->setTitle('Итоги');
    $summarySheet->setCellValue('A1', 'Менеджер');
    $summarySheet->setCellValue('B1', 'Общая сумма');
    $summarySheet->getStyle('A1:B1')->applyFromArray($headerStyle);
    $summarySheet->getRowDimension('1')->setRowHeight(20);

    $rowIndexSummary = 2;
    $grandTotal = 0;

    foreach ($managers as $manager) {
        $managerUsername = $manager['manager_username'];
        $managerId = $manager['manager_id'];

        // Создаём лист для менеджера
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle($managerUsername);

        // Заголовки
        $sheet->setCellValue('A1', 'Дата');
        $sheet->setCellValue('B1', 'Сумма');
        $sheet->setCellValue('C1', 'Кем пополнено');
        $sheet->setCellValue('D1', 'Ссылка на чек');
        $sheet->getStyle('A1:D1')->applyFromArray($headerStyle);
        $sheet->getRowDimension('1')->setRowHeight(20);

        // Получаем выплаты по менеджеру
        $stmt = $pdo->prepare("SELECT created_at, amount, paid_by, path_reciept_img FROM payouts WHERE manager_id = ?");
        $stmt->execute([$managerId]);
        $payouts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $rowIndex = 2;
        $total = 0;

        foreach ($payouts as $payout) {
            $date = $payout['created_at'];
            $amount = $payout['amount'];
            $paid_by = $payout['paid_by'];
            $img = $payout['path_reciept_img'];

            // Получаем username по paid_by
            $stmtUser = $pdo->prepare("SELECT username FROM users WHERE id_usertg = ?");
            $stmtUser->execute([$paid_by]);
            $user = $stmtUser->fetch(PDO::FETCH_ASSOC);
            $paid_by_username = $user ? $user['username'] : $paid_by;

            $sheet->setCellValue('A' . $rowIndex, $date);
            $sheet->setCellValue('B' . $rowIndex, $amount);
            $sheet->setCellValue('C' . $rowIndex, $paid_by_username);
            $sheet->setCellValue('D' . $rowIndex, 'https://inhomeka.online:8000/' . ltrim($img, '/'));

            $sheet->getStyle('A' . $rowIndex . ':D' . $rowIndex)->applyFromArray($contentStyle);
            $sheet->getRowDimension($rowIndex)->setRowHeight(20);

            $total += $amount;
            $rowIndex++;
        }

        // Итог по менеджеру
        $sheet->setCellValue('A' . $rowIndex, 'Итого');
        $sheet->setCellValue('B' . $rowIndex, $total);
        $sheet->getStyle('A' . $rowIndex . ':B' . $rowIndex)->applyFromArray($totalStyle);

        foreach (range('A', 'D') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Добавляем в итоговую страницу
        $summarySheet->setCellValue('A' . $rowIndexSummary, $managerUsername);
        $summarySheet->setCellValue('B' . $rowIndexSummary, $total);
        $summarySheet->getStyle('A' . $rowIndexSummary . ':B' . $rowIndexSummary)->applyFromArray($contentStyle);

        $grandTotal += $total;
        $rowIndexSummary++;
    }

    // Общая сумма по всем менеджерам
    $summarySheet->setCellValue('A' . $rowIndexSummary, 'Общая сумма');
    $summarySheet->setCellValue('B' . $rowIndexSummary, $grandTotal);
    $summarySheet->getStyle('A' . $rowIndexSummary . ':B' . $rowIndexSummary)->applyFromArray($totalStyle);

    $summarySheet->getColumnDimension('A')->setWidth(30);
    $summarySheet->getColumnDimension('B')->setWidth(20);

    // Перемещаем итоговый лист в конец
    $spreadsheet->setActiveSheetIndex($spreadsheet->getSheetCount() - 1);

    // Удаляем первый пустой лист
    $spreadsheet->removeSheetByIndex(0);

    // Сохраняем Excel-файл во временную директорию
    $filename = 'payout_history.xlsx';
    $temp_file = sys_get_temp_dir() . '/' . $filename;

    $writer = new Xlsx($spreadsheet);
    $writer->save($temp_file);

    // Отправляем файл клиенту
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . filesize($temp_file));
    ob_clean();
    flush();
    readfile($temp_file);
    unlink($temp_file);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
