<?php
require_once 'db.php';
include 'cors.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['username'])) {
    $newUsername = $data['username'];
    $id_usertg = $data['id_usertg'];

    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("UPDATE users SET username = :username WHERE id_usertg = :id_usertg");
        $stmt->bindParam(':username', $newUsername);
        $stmt->bindParam(':id_usertg', $id_usertg);
        $stmt->execute();

        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid data']);
}
?>