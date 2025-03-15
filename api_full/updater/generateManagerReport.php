<?php
include 'db.php';
//include 'cors.php';
header('Content-Type: application/json');

// Подключение библиотеки PhpSpreadsheet
require '../vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

try {
    // Подключение к базе данных
    $pdo = getDbConnection();

    // Запрос всех менеджеров из таблицы products
    $stmt = $pdo->query("SELECT DISTINCT tg_nick_manager FROM products WHERE tg_nick_manager IS NOT NULL AND tg_nick_manager != ''");
    $managers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Создание нового объекта Spreadsheet
    $spreadsheet = new Spreadsheet();

    foreach ($managers as $manager) {
        $managerNick = $manager['tg_nick_manager'];

        // Создание нового листа для каждого менеджера
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle($managerNick);

        // Запись заголовков
        $sheet->setCellValue('A1', 'Название товара');
        $sheet->setCellValue('B1', 'Выгода');
        $sheet->setCellValue('C1', 'Количество завершенных шагов');
        $sheet->setCellValue('D1', 'Общая выгода');

        // Запрос товаров для текущего менеджера
        $stmt = $pdo->prepare("SELECT id, name, market_price, your_price FROM products WHERE tg_nick_manager = :managerNick");
        $stmt->execute(['managerNick' => $managerNick]);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $rowIndex = 2;
        $totalBenefit = 0;

        foreach ($products as $product) {
            $productId = $product['id'];
            $productName = $product['name'];
            $marketPrice = $product['market_price'];
            $yourPrice = $product['your_price'];
            $benefit = $marketPrice - $yourPrice;

            // Запрос количества завершенных шагов для текущего товара
            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM steps WHERE id_product = :productId AND step = 'Завершено' AND status = 3");
            $stmt->execute(['productId' => $productId]);
            $stepCount = $stmt->fetchColumn();

            $totalProductBenefit = $benefit * $stepCount;

            // Запись данных в таблицу
            $sheet->setCellValue('A' . $rowIndex, $productName);
            $sheet->setCellValue('B' . $rowIndex, $benefit);
            $sheet->setCellValue('C' . $rowIndex, $stepCount);
            $sheet->setCellValue('D' . $rowIndex, $totalProductBenefit);

            $totalBenefit += $totalProductBenefit;
            $rowIndex++;
        }

        // Запись общей суммы под таблицей
        $sheet->setCellValue('C' . $rowIndex, 'Итого');
        $sheet->setCellValue('D' . $rowIndex, $totalBenefit);
    }

    // Создание итогового листа
    $summarySheet = $spreadsheet->createSheet();
    $summarySheet->setTitle('Итоги');

    // Запись заголовков
    $summarySheet->setCellValue('A1', 'Менеджер');
    $summarySheet->setCellValue('B1', 'Общая сумма');

    $rowIndex = 2;
    $grandTotal = 0;

    foreach ($managers as $manager) {
        $managerNick = $manager['tg_nick_manager'];

        // Запрос общей суммы для текущего менеджера
        $stmt = $pdo->prepare("SELECT SUM((market_price - your_price) * (SELECT COUNT(*) FROM steps WHERE id_product = products.id AND step = 'Завершено' AND status = 3)) as total FROM products WHERE tg_nick_manager = :managerNick");
        $stmt->execute(['managerNick' => $managerNick]);
        $total = $stmt->fetchColumn();

        // Запись данных в итоговую таблицу
        $summarySheet->setCellValue('A' . $rowIndex, $managerNick);
        $summarySheet->setCellValue('B' . $rowIndex, $total);

        $grandTotal += $total;
        $rowIndex++;
    }

    // Запись общей суммы всех менеджеров
    $summarySheet->setCellValue('A' . $rowIndex, 'Общая сумма');
    $summarySheet->setCellValue('B' . $rowIndex, $grandTotal);

    // Удаление первого пустого листа
    $spreadsheet->removeSheetByIndex(0);

    // Сохранение Excel-файла во временную директорию
    $filename = 'ManagerReport.xlsx';
    $temp_file = sys_get_temp_dir() . '/' . $filename;

    $writer = new Xlsx($spreadsheet);
    $writer->save($temp_file);

    // Отправка файла клиенту
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . filesize($temp_file));
    
    // Убедитесь, что ничего не выводится до этого момента
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
