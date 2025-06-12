<?php
require_once 'db.php';
require_once 'cors.php';
header('Content-Type: application/json');

// Генерация уникального referral_id
function generateReferralId($pdo) {
    $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    $length = 6;
    do {
        $referral_id = '';
        for ($i = 0; $i < $length; $i++) {
            $referral_id .= $characters[random_int(0, strlen($characters) - 1)];
        }
        // Проверяем уникальность
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE referral_id = ?");
        $stmt->execute([$referral_id]);
        $exists = $stmt->fetchColumn() > 0;
    } while ($exists);
    return $referral_id;
}

try {
    $pdo = getDbConnection();
    $id_usertg = $_GET['id_usertg'] ?? null;
    if (!$id_usertg) {
        echo json_encode(['success' => false, 'message' => 'Не указан id_usertg']);
        exit;
    }

    // Проверяем, существует ли пользователь в таблице referrals
    $stmtRef = $pdo->prepare("SELECT id FROM referrals WHERE id_usertg = ?");
    $stmtRef->execute([$id_usertg]);
    $rowRef = $stmtRef->fetch(PDO::FETCH_ASSOC);

    // Если пользователя нет — создаём его
    if (!$rowRef) {
        $insertRef = $pdo->prepare("INSERT INTO referrals (id_usertg) VALUES (?)");
        $insertRef->execute([$id_usertg]);
    }

    $stmt = $pdo->prepare("SELECT referral_id FROM users WHERE id_usertg = ?");
    $stmt->execute([$id_usertg]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    $referral_id = $row['referral_id'] ?? null;

    if ($referral_id) {
        echo json_encode(['success' => true, 'referral_id' => $referral_id]);
        exit;
    }

    // Генерируем и сохраняем новый referral_id
    $referral_id = generateReferralId($pdo);
    $update = $pdo->prepare("UPDATE users SET referral_id = ? WHERE id_usertg = ?");
    $update->execute([$referral_id, $id_usertg]);

    echo json_encode(['success' => true, 'referral_id' => $referral_id]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
