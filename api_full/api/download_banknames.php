<?php
require 'db.php';

try {
    $conn = getDbConnection();
    $stmt = $conn->query("SELECT bankname, COUNT(*) as cnt FROM steps WHERE bankname IS NOT NULL AND bankname != '' GROUP BY bankname ORDER BY cnt DESC");
    $banks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $lines = [];
    foreach ($banks as $row) {
        $lines[] = $row['bankname'] . " - " . $row['cnt'];
    }
    $txt = implode("\r\n", $lines);

    header('Content-Type: text/plain');
    header('Content-Disposition: attachment; filename="top_banknames.txt"');
    header('Content-Length: ' . strlen($txt));
    echo $txt;
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo "Ошибка: " . $e->getMessage();
    exit;
}
