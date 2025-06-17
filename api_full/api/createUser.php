<?php
header('Content-Type: application/json');
require 'db.php';
include 'cors.php';

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'];
$username = $input['username'];
$referral_id = isset($input['referral_id']) ? $input['referral_id'] : null;

try {
    $conn = getDbConnection();

    // Удаление существующей записи
    $deleteStmt = $conn->prepare("DELETE FROM users WHERE id_usertg = :id");
    $deleteStmt->bindParam(':id', $id);
    $deleteStmt->execute();

    $inviter_id_usertg = null;
    $invited_updated = false;
    if ($referral_id) {
        // Найти пользователя по referral_id
        $stmt = $conn->prepare("SELECT id_usertg FROM users WHERE referral_id = :referral_id LIMIT 1");
        $stmt->bindParam(':referral_id', $referral_id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row && isset($row['id_usertg'])) {
            $inviter_id_usertg = $row['id_usertg'];

            // Проверить, есть ли запись в referrals для inviter
            $stmtRefInviter = $conn->prepare("SELECT id FROM referrals WHERE id_usertg = :inviter_id");
            $stmtRefInviter->bindParam(':inviter_id', $inviter_id_usertg);
            $stmtRefInviter->execute();
            $rowRefInviter = $stmtRefInviter->fetch(PDO::FETCH_ASSOC);

            if (!$rowRefInviter) {
                // Если нет записи — создать с invited=1
                $insertRefInviter = $conn->prepare("INSERT INTO referrals (id_usertg, invited) VALUES (:inviter_id, 1)");
                $insertRefInviter->bindParam(':inviter_id', $inviter_id_usertg);
                $insertRefInviter->execute();
                $invited_updated = true;
            } else {
                // Если есть — увеличить invited
                $updateRef = $conn->prepare("UPDATE referrals SET invited = invited + 1 WHERE id_usertg = :inviter_id");
                $updateRef->bindParam(':inviter_id', $inviter_id_usertg);
                $updateRef->execute();
                $invited_updated = true;
            }
        }
    }

    // Вставка новой записи
    if ($inviter_id_usertg) {
        $stmt = $conn->prepare("INSERT INTO users (id_usertg, username, status, inviter_id_usertg) VALUES (:id, :username, 'user', :inviter_id_usertg)");
        $stmt->bindParam(':inviter_id_usertg', $inviter_id_usertg);
    } else {
        $stmt = $conn->prepare("INSERT INTO users (id_usertg, username, status) VALUES (:id, :username, 'user')");
    }
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':username', $username);
    $stmt->execute();

    // Вызов top_updater.php только если был увеличен invited
    if ($invited_updated) {
        $topUpdaterPath = dirname(__DIR__) . '/updater/top_updater.php';
        if (file_exists($topUpdaterPath)) {
            include_once $topUpdaterPath;
        }
    }

    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Insert failed: " . $e->getMessage()]);
}
?>