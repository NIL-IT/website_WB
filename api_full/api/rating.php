<?php
require_once 'db.php';
require_once 'cors.php';
header('Content-Type: application/json');

try {
    $pdo = getDbConnection();
    $useridTG = $_GET['useridTG'] ?? null;
    if (!$useridTG) {
        echo json_encode(['success' => false, 'message' => 'Не указан useridTG']);
        exit;
    }

    // Получаем score и invited из referrals
    $stmt = $pdo->prepare("SELECT score, invited FROM referrals WHERE id_usertg = ?");
    $stmt->execute([$useridTG]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    $score = $row['score'] ?? 0;
    $invited = $row['invited'] ?? 0;
    $top = 0;

    if ($score > 0) {
        // Получаем место пользователя по score (чем больше score, тем выше место)
        $stmtTop = $pdo->prepare("SELECT COUNT(*) + 1 AS place FROM referrals WHERE score > ?");
        $stmtTop->execute([$score]);
        $topRow = $stmtTop->fetch(PDO::FETCH_ASSOC);
        $top = $topRow['place'] ?? 0;
    }

    $googleTableUrl = 'https://docs.google.com/spreadsheets/d/ВАШ_ID_ТАБЛИЦЫ';

    echo json_encode([
        'success' => true,
        'score' => $score,
        'invited' => $invited,
        'top' => $top,
        'google_table_url' => $googleTableUrl
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
