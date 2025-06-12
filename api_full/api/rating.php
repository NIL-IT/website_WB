<?php
require_once 'db.php';
require_once 'cors.php';
header('Content-Type: application/json');

try {
    $pdo = getDbConnection();
    $id_usertg = $_GET['id_usertg'] ?? null;
    if (!$id_usertg) {
        echo json_encode(['success' => false, 'message' => 'Не указан id_usertg']);
        exit;
    }

    // Получаем score и invited из referrals
    $stmt = $pdo->prepare("SELECT score, invited FROM referrals WHERE id_usertg = ?");
    $stmt->execute([$id_usertg]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        echo json_encode(['success' => false, 'referral' => false]);
        exit;
    }

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
    echo json_encode([
        'success' => true,
        'score' => $score,
        'invited' => $invited,
        'top' => $top
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
