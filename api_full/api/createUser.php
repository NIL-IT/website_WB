<?php
header('Content-Type: application/json');
require 'db.php';
include 'cors.php';
$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'];
$username = $input['username'];

try {
    $conn = getDbConnection();
    $stmt = $conn->prepare("INSERT INTO users (id_userTG, username, status) VALUES (:id, :username, 'user')");
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':username', $username);
    $stmt->execute();

    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Insert failed: " . $e->getMessage()]);
}
?>
