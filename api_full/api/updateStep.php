<?php
header('Content-Type: application/json');
include 'cors.php'; 
require_once 'db.php'; 

try {
    $pdo = getDbConnection(); 
    $data = $_POST;

    if (!isset($data['id'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid input: id is missing']);
        exit;
    }

    $id = $data['id'];


    $stmt = $pdo->prepare('SELECT step, id_product FROM steps WHERE id = :id');
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        echo json_encode(['success' => false, 'error' => 'User step not found for id: ' . $id]);
        exit;
    }

    $currentStep = $row['step'];
    $idProduct = $row['id_product'];

    if ($currentStep >= 0 && $currentStep <= 5) {
        $stmt = $pdo->prepare('SELECT available_day_current FROM products WHERE id = :id_product');
        $stmt->bindParam(':id_product', $idProduct, PDO::PARAM_INT);
        $stmt->execute();
        $productRow = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$productRow) {
            echo json_encode(['success' => false, 'error' => 'Product not found for id_product: ' . $idProduct]);
            exit;
        }

        $availableDay = $productRow['available_day_current'];


        if ($availableDay == 0) {
            echo json_encode(['success' => false, 'error' => 'Продукт не доступен сегодня']);
            exit;
    }
    }

    if ($currentStep === '0') {
        $stmt = $pdo->prepare('UPDATE steps SET step = 1 WHERE id = :id');
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Step updated to 1 successfully']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to update step to 1']);
        }
    } 
    
    
    
    
    elseif ($currentStep === '1') {
        if (!isset($data['image1'])) {
            echo json_encode(['success' => false, 'error' => 'Image data not provided']);
            exit;
        }
        $imageData = $data['image1'];
        $imageDirectory = 'uploads/'; 
        $imageName = uniqid() . '.png'; 
        $imagePath = $imageDirectory . $imageName;
        $imageDecoded = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imageData));
        if ($imageDecoded !== false && file_put_contents($imagePath, $imageDecoded)) {
            $stmt = $pdo->prepare('UPDATE steps SET image1 = :imagePath, step = 2 WHERE id = :id');
            $stmt->bindParam(':imagePath', $imagePath, PDO::PARAM_STR);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Image saved and step updated to 2 successfully']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Failed to update step to 2']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to save image']);
        }
    } 
    
    
    
    
    elseif ($currentStep === '2') {
        if (!isset($data['image2'])) {
            echo json_encode(['success' => false, 'error' => 'Second image data not provided']);
            exit;
        }
        $imageData = $data['image2'];
        $imageDirectory = 'uploads/'; 
        $imageName = uniqid() . '.png'; 
        $imagePath = $imageDirectory . $imageName;
        $imageDecoded = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imageData));
        if ($imageDecoded !== false && file_put_contents($imagePath, $imageDecoded)) {
            $stmt = $pdo->prepare('UPDATE steps SET image2 = :imagePath, step = 3 WHERE id = :id');
            $stmt->bindParam(':imagePath', $imagePath, PDO::PARAM_STR);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Second image saved and step updated to 3 successfully']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Failed to update step to 3']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to save second image']);
        }
    } 
    
    
    
    
    elseif ($currentStep === '3') {
        $stmt = $pdo->prepare('UPDATE steps SET step = 4 WHERE id = :id');
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Step updated to 4 successfully']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to update step to 4']);
        }
    } 
    
    
    
    
    elseif ($currentStep === '4') {
            if (!isset($data['cardNumber']) || !isset($data['bankName']) || !isset($data['cardHolder']) || !isset($data['phone'])) {
            echo json_encode(['success' => false, 'error' => 'Missing data for step 4']);
            exit;
        }
        $cardNumber = $data['cardNumber'];
        $bankName = $data['bankName'];
        $cardHolder = $data['cardHolder'];
        $phone = $data['phone'];
            $stmt = $pdo->prepare('UPDATE steps SET cardNumber = :cardNumber, bankName = :bankName, cardHolder = :cardHolder, phone = :phone, step = 5 WHERE id = :id');
        $stmt->bindParam(':cardNumber', $cardNumber, PDO::PARAM_STR);
        $stmt->bindParam(':bankName', $bankName, PDO::PARAM_STR);
        $stmt->bindParam(':cardHolder', $cardHolder, PDO::PARAM_STR);
        $stmt->bindParam(':phone', $phone, PDO::PARAM_STR);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Data saved and step updated to 4 successfully']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to update step to 4']);
        }
    } 
    
    
    
    
    elseif ($currentStep === '5') {
        if (!isset($data['image3'])) {
            echo json_encode(['success' => false, 'error' => 'Image data not provided']);
            exit;
        }
        $imageData = $data['image3'];
        $imageDirectory = 'uploads/'; 
        $imageName = uniqid() . '.png'; 
        $imagePath = $imageDirectory . $imageName;
        $imageDecoded = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imageData));
        if ($imageDecoded !== false && file_put_contents($imagePath, $imageDecoded)) {
            $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare('UPDATE steps SET image3 = :imagePath, step = 6 WHERE id = :id');
            $stmt->bindParam(':imagePath', $imagePath, PDO::PARAM_STR);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            if ($stmt->execute()) {
                $stmt = $pdo->prepare('UPDATE products SET available_day_current = available_day_current - 1, amount_max = amount_max - 1 WHERE id = :id_product');
                $stmt->bindParam(':id_product', $idProduct, PDO::PARAM_INT);
                if ($stmt->execute()) {   
                    $pdo->commit();
                    echo json_encode(['success' => true, 'message' => 'Image saved, step updated to 6, and product availability updated successfully']);
                } else {
                    $pdo->rollBack();
                    echo json_encode(['success' => false, 'error' => 'Failed to update product availability']);
                }
            } else {
                $pdo->rollBack();
                echo json_encode(['success' => false, 'error' => 'Failed to update step to 6']);
            }
        } catch (Exception $e) {
            // Откат транзакции в случае исключения
            $pdo->rollBack();
            echo 'Error: ' . $e->getMessage() . "\n";
        }
    } }

    
    
    
    elseif ($currentStep === '6') {
        if (!isset($data['image4'])) {
            echo json_encode(['success' => false, 'error' => 'Image data not provided']);
            exit;
        }
        $imageData = $data['image4'];
        $imageDirectory = 'uploads/'; 
        $imageName = uniqid() . '.png'; 
        $imagePath = $imageDirectory . $imageName;
        $imageDecoded = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imageData));
        if ($imageDecoded !== false && file_put_contents($imagePath, $imageDecoded)) {
            $stmt = $pdo->prepare('UPDATE steps SET image4 = :imagePath, step = 7 WHERE id = :id');
            $stmt->bindParam(':imagePath', $imagePath, PDO::PARAM_STR);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Image saved and step updated to 7 successfully']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Failed to update step to 7']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to save image']);
        }
    } 
    
    
    
    
    elseif ($currentStep === '7') {
        if (!isset($data['image5']) || !isset($data['image6'])) {
            echo json_encode(['success' => false, 'error' => 'Fifth and/or sixth image data not provided']);
            exit;
        }
        $imageData5 = $data['image5'];
        $imageData6 = $data['image6'];
        $imageDirectory = 'uploads/'; 
        $imageName5 = uniqid() . '.png'; 
        $imagePath5 = $imageDirectory . $imageName5;
        $imageDecoded5 = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imageData5));
        $imageName6 = uniqid() . '.png'; 
        $imagePath6 = $imageDirectory . $imageName6;
        $imageDecoded6 = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imageData6));
        if ($imageDecoded5 !== false && file_put_contents($imagePath5, $imageDecoded5)) {
            $stmt = $pdo->prepare('UPDATE steps SET image5 = :imagePath5, image6 = :imagePath6, step = :finalStep WHERE id = :id');
            $finalStep = 'Завершено'; 
            $stmt->bindParam(':imagePath5', $imagePath5, PDO::PARAM_STR);
            $stmt->bindParam(':imagePath6', $imagePath6, PDO::PARAM_STR);
            $stmt->bindParam(':finalStep', $finalStep, PDO::PARAM_STR);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Fifth and sixth images saved and step updated to final successfully']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Failed to update step to final for fifth and sixth images']);
            }
        } else {
        echo json_encode(['success' => false, 'error' => 'Invalid current step: ' . $currentStep]);
    }
}

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>