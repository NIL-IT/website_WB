<?php
require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

$inputFileName = __DIR__ . "/Excel_Payment(2025-09-15) (3).xlsx";

// Загружаем Excel
$spreadsheet = IOFactory::load($inputFileName);
$sheet = $spreadsheet->getSheetByName('Отчёт');

// Преобразуем в массив
$rows = $sheet->toArray(null, true, true, true);

// Найдём индексы колонок "Дата" и "Статус"
$headers = $rows[1];
$dateCol = array_search("Дата", $headers);
$statusCol = array_search("Статус", $headers);

$values = [];
for ($i = 2; $i <= count($rows); $i++) {
    if (!isset($rows[$i])) continue;
    $date = $rows[$i][$dateCol] ?? null;
    $status = $rows[$i][$statusCol] ?? null;

    if ($date && $status) {
        // Экранируем одинарные кавычки в статусе
        $status = str_replace("'", "''", $status);
        $date = str_replace("'", "''", $date);
        $values[] = "('$date', '$status')";
    }
}

if (count($values) === 0) {
    echo "Нет данных для обновления.\n";
    exit;
}

$valuesBlock = implode(",\n        ", $values);

$sql = "
UPDATE steps
SET status = CASE
    WHEN s.\"Статус\" = 'подтверждён/не оплачен' THEN 2
    WHEN s.\"Статус\" = 'подтверждён/оплачен' THEN 3
    ELSE steps.status
END
FROM (
    VALUES
        $valuesBlock
) AS s(completed_at, \"Статус\")
WHERE steps.completed_at = s.completed_at;
";

file_put_contents("update_steps.sql", $sql);

echo "SQL запрос сохранён в update_steps.sql\n";


