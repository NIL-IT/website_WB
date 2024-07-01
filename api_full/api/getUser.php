<?php
header('Content-Type: application/json');
include 'cors.php';
require 'db.php';

$id = $_GET['id'];

try {
    $conn = getDbConnection();
    $stmt = $conn->prepare("SELECT * FROM users WHERE id_userTG = :id");
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode(["success" => true, "data" => $user]);
    } else {
        echo json_encode(["success" => false, "message" => "User not found"]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Query failed: " . $e->getMessage()]);
}
?>