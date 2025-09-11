<?php
require 'vendor/autoload.php';
include 'db.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

try {
    // Создаём Excel
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle("Отчёт");

    // Стили для заголовков
    $headerStyle = [
        'font' => ['bold' => true],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFD9D9D9']]
    ];

    $contentStyle = [
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
    ];

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
        'K1' => 'ID банка для СБП',
        'L1' => 'Статус',
        'M1' => 'Дата',
    ];

    foreach ($headers as $cell => $text) {
        $sheet->setCellValue($cell, $text);
    }

    $sheet->getStyle('A1:M1')->applyFromArray($headerStyle);
    $sheet->getRowDimension('1')->setRowHeight(20);

    // Получение данных из steps, где in_excel = true
    $pdo = getDbConnection();
    $stmt = $pdo->query("SELECT * FROM steps WHERE in_excel = true");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

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
        $id_product = $row['id_product'] ?? null;
        if ($id_product) {
            $stmtProd = $pdo->prepare("SELECT market_price, your_price, name FROM products WHERE id = ?");
            $stmtProd->execute([$id_product]);
            $prod = $stmtProd->fetch(PDO::FETCH_ASSOC);
            if ($prod) {
                $productName = $prod['name'] ?? '';
                if (empty($row['modified_payment'])) {
                    $sum = $prod['market_price'] - $prod['your_price'];
                }
            }
        }
        // Сумма
        $sum = '';
        if (!empty($row['modified_payment'])) {
            $sum = $row['modified_payment'];
        } 
        // Номер карты (как строка)
        $cardnumber = isset($row['cardnumber']) ? (string)$row['cardnumber'] : '';
        // Телефон для СБП
        $sbp_phone = $phone;
        // ID банка для СБП
        $id_bank = '';
        if (!empty($row['bankname'])) {
            $stmtBank = $pdo->prepare("SELECT id_bank FROM banks WHERE bankname = ?");
            $stmtBank->execute([$row['bankname']]);
            $bank = $stmtBank->fetch(PDO::FETCH_ASSOC);
            if ($bank) {
                $id_bank = $bank['id_bank'];
            }
        }
        // Статус
        $status_col = $row['status'] ?? '';
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
        $sheet->setCellValue('K'.$rowIndex, $id_bank);
        $sheet->setCellValue('L'.$rowIndex, $status_col);
        $sheet->setCellValue('M'.$rowIndex, $date);
        $sheet->getStyle('A'.$rowIndex.':M'.$rowIndex)->applyFromArray($contentStyle);
        // Отправка сообщения в Telegram
        if (!empty($row['id_usertg'])) {
            $chatId = $row['id_usertg'];
            $botToken = "7077985036:AAFHZ-JKekDokComqzFC6-f7-uijdDeKlTw";
            $apiUrl = "https://api.telegram.org/bot$botToken/sendMessage";
            // Первое сообщение
            $message1 = "❤️ Спасибо за участие! Ваш заказ был отправлен на оплату!";
            $postFields1 = [
                'chat_id' => $chatId,
                'text' => $message1,
                'parse_mode' => 'HTML'
            ];
            $ch1 = curl_init();
            curl_setopt($ch1, CURLOPT_URL, $apiUrl);
            curl_setopt($ch1, CURLOPT_POST, true);
            curl_setopt($ch1, CURLOPT_POSTFIELDS, $postFields1);
            curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch1, CURLOPT_SSL_VERIFYPEER, false);
            curl_exec($ch1);
            curl_close($ch1);
            // Второе сообщение
            $message2 = "🎉 Приглашайте в закрытый клуб своих друзей, чтобы они тоже могли покупать с выгодой и участвовать в развитии бренда. Чтобы пригласить друга - просто перешлите ему сообщение ниже:";
            $postFields2 = [
                'chat_id' => $chatId,
                'text' => $message2,
                'parse_mode' => 'HTML'
            ];
            $ch2 = curl_init();
            curl_setopt($ch2, CURLOPT_URL, $apiUrl);
            curl_setopt($ch2, CURLOPT_POST, true);
            curl_setopt($ch2, CURLOPT_POSTFIELDS, $postFields2);
            curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
            curl_exec($ch2);
            curl_close($ch2);
            // Третье сообщение с персональной ссылкой
            // Получаем referral_id через локальный HTTP-запрос к referral.php
            $referralApiUrl = "https://inhomeka.online:8000/referral.php";
            $postData = json_encode(['id_usertg' => $chatId]);
            $ch = curl_init($referralApiUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
            $response = curl_exec($ch);
            curl_close($ch);
            $referral_id = null;
            if ($response) {
                $referralData = json_decode($response, true);
                if (isset($referralData['success']) && $referralData['success'] && isset($referralData['referral_id'])) {
                    $referral_id = $referralData['referral_id'];
                }
            }
            if (!$referral_id) {
                $referral_id = "unknown";
            }
            $inviteLink = "https://t.me/wb_cashback_nsk_bot?start=ref" . $referral_id;
            $message3 = "Привет! Я нашел закрытый клуб бренда товаров для дома INHOMEKA, там раздают товары бренда с кэшбеком 80-100%, а еще можно поучаствовать в развитии бренда и получить за это бонусы! 🎁\n\n"
                . "🔵 Это моя <a href='$inviteLink'>персональная пригласительная ссылка</a> для тебя.\n"
                . "Вступай в клуб и становись частью закрытого сообщества бренда INHOMEKA.";
            $postFields3 = [
                'chat_id' => $chatId,
                'text' => $message3,
                'parse_mode' => 'HTML'
            ];
            $ch3 = curl_init();
            curl_setopt($ch3, CURLOPT_URL, $apiUrl);
            curl_setopt($ch3, CURLOPT_POST, true);
            curl_setopt($ch3, CURLOPT_POSTFIELDS, $postFields3);
            curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch3, CURLOPT_SSL_VERIFYPEER, false);
            curl_exec($ch3);
            curl_close($ch3);
        }
        $rowIndex++;
    }
    // После экспорта обновить in_excel = false
    $pdo->query("UPDATE steps SET in_excel = false WHERE in_excel = true");

    // Автоматическая ширина столбцов
    foreach (range('A', 'M') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }

    // Сохранение файла
    $filename = "Report.xlsx";
    $temp_file = sys_get_temp_dir() . '/' . $filename;

    $writer = new Xlsx($spreadsheet);
    $writer->save($temp_file);

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
