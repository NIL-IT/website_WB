<?php
header('Content-Type: application/json');
include 'cors.php'; 
require_once 'db.php'; 

try {
    function sendTelegramMessage($chatId, $dealNumber, $productName, $userName, $userHandle) {
        $botToken = "7077985036:AAFHZ-JKekDokComqzFC6-f7-uijdDeKlTw";
        $apiUrl = "https://api.telegram.org/bot$botToken/sendMessage";
        
        $message = "<b>Заказ оформлен</b>\nСделка№ $dealNumber\n\nТовар: $productName\nПользователь: $userName\n(@$userHandle)";
        $message = urlencode($message);
    
        $url = "$apiUrl?chat_id=$chatId&text=$message&parse_mode=HTML";
    
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $output = curl_exec($ch);
        curl_close($ch);
    
        return $output;
    }
    function sendTelegramMessage_final($chatId, $dealNumber, $productName, $userName, $userHandle) {
        $botToken = "7077985036:AAFHZ-JKekDokComqzFC6-f7-uijdDeKlTw";
        
        $apiUrl = "https://api.telegram.org/bot$botToken/sendMessage";
        
        $message = "<b>Заказ получен</b>\nСделка№ $dealNumber\n\nТовар: $productName\nПользователь: $userName\n(@$userHandle)";
        $reportUrl = "https://testingnil.ru/report/$dealNumber"; 

        $replyMarkup = '{"inline_keyboard":[[{"text":"Отчет","web_app":{"url":"' . $reportUrl . '"}}]]}';
        
        $url = "$apiUrl?chat_id=$chatId&text=" . urlencode($message) . "&parse_mode=HTML&reply_markup=" . urlencode($replyMarkup);
    
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
        
        $response = curl_exec($ch);
        
        if (curl_errno($ch)) {
            echo 'Ошибка cURL: ' . curl_error($ch);
        }
        curl_close($ch);
        return $response;
    }
    $pdo = getDbConnection(); 
    $data = $_POST;

    if (!isset($data['id'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid input: id is missing']);
        exit;
    }
    
        $id_usertg = $data['id_usertg'];
 

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
    

    if ($currentStep == 5 || $currentStep == 7) {
        $stmt = $pdo->prepare('SELECT tg_nick, name FROM products WHERE id = :id_product');
        $stmt->bindParam(':id_product', $idProduct, PDO::PARAM_INT);
        $stmt->execute();
        $productRow = $stmt->fetch(PDO::FETCH_ASSOC);
    
        if (!$productRow) {
            echo json_encode(['success' => false, 'error' => 'Product not found for id_product: ' . $idProduct]);
            exit;
        }
    
        $tg_nick = $productRow['tg_nick'];
        $Product_name = $productRow['name'];
    }








    if ($currentStep === '0') {
        $stmt = $pdo->prepare('UPDATE steps SET step = 1, updated_at = :updated_at WHERE id = :id');
        $currentDateTime = date('Y-m-d H:i:s');
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':updated_at', $currentDateTime, PDO::PARAM_STR);
        
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
                // Обновляем таблицу steps: устанавливаем image3 и обновляем шаг до 6
                $stmt = $pdo->prepare('UPDATE steps SET image3 = :imagePath, step = 6 WHERE id = :id');
                $stmt->bindParam(':imagePath', $imagePath, PDO::PARAM_STR);
                $stmt->bindParam(':id', $id, PDO::PARAM_INT);
                
                if ($stmt->execute()) {
                    // Получаем текущую дату в формате Y-m-d по Москве
                    $currentDate = new DateTime('now', new DateTimeZone('Europe/Moscow'));
                    $currentDateString = $currentDate->format('Y-m-d');
    
                    // Получаем available_day для данного продукта
                    $stmt = $pdo->prepare('SELECT available_day, available_day_current FROM products WHERE id = :id_product');
                    $stmt->bindParam(':id_product', $idProduct, PDO::PARAM_INT);
                    $stmt->execute();
                    $result = $stmt->fetch(PDO::FETCH_ASSOC);
                    
                    if ($result) {
                        $availableDayJson = $result['available_day'];
                        $availableDayCurrent = $result['available_day_current'];
                        $availableDayArray = json_decode($availableDayJson, true);
    
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            throw new Exception("Error decoding JSON for product ID $idProduct: " . json_last_error_msg());
                        }
    
                        // Уменьшаем значение в available_day для текущей даты
                        if (isset($availableDayArray[$currentDateString])) {
                            $availableDayArray[$currentDateString]--;
    
                            // Уменьшаем available_day_current
                            $availableDayCurrent--;
    
                            // Конвертируем обратно в JSON
                            $updatedAvailableDayJson = json_encode($availableDayArray);
    
                            // Обновляем значения в базе данных
                            $updateStmt = $pdo->prepare('
                                UPDATE products 
                                SET available_day = :available_day, available_day_current = :available_day_current 
                                WHERE id = :id_product
                            ');
                            $updateStmt->bindParam(':available_day', $updatedAvailableDayJson, PDO::PARAM_STR);
                            $updateStmt->bindParam(':available_day_current', $availableDayCurrent, PDO::PARAM_INT);
                            $updateStmt->bindParam(':id_product', $idProduct, PDO::PARAM_INT);
                            $updateStmt->execute();
                        } else {
                            throw new Exception("No available day found for date $currentDateString");
                        }
    
                        // Отправка уведомления в Telegram
                        $sql = "SELECT id_usertg FROM users WHERE username = :username";
                        $stmt = $pdo->prepare($sql);
                        $stmt->bindParam(':username', $tg_nick, PDO::PARAM_STR);
                        $stmt->execute();
                        $result = $stmt->fetch(PDO::FETCH_ASSOC);
                        
                        if ($result) {
                            $chatId_t = $result['id_usertg'];
                        } else {
                            throw new Exception("Введите имя пользователя в профиле для связи продавца с вами. Вводить без @.");
                        }
    
                        $sql = "SELECT username FROM users WHERE id_usertg = :id_usertg";
                        $stmt = $pdo->prepare($sql);
                        $stmt->bindParam(':id_usertg', $id_usertg, PDO::PARAM_INT);
                        $stmt->execute();
                        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
                        $chatId = $chatId_t;
                        $dealNumber = $id;
                        $productName = $Product_name;
                        $userName = $user["username"];
                        $userHandle = $user["username"];
                        $response = sendTelegramMessage($chatId, $dealNumber, $productName, $userName, $userHandle);
    
                        $pdo->commit();
                        echo json_encode(['success' => true, 'answer'=> $response, 'message' => 'Image saved, step updated to 6, and product availability updated successfully']);
                    } else {
                        throw new Exception("Product with ID $idProduct not found");
                    }
                } else {
                    $pdo->rollBack();
                    echo json_encode(['success' => false, 'error' => 'Failed to update step to 6']);
                }
            } catch (Exception $e) {
                $pdo->rollBack();
                echo json_encode(['success' => false, 'error' => 'Error: ' . $e->getMessage()]);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to save image']);
        }
    }
    
    
    







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
    

        if ($imageDecoded5 !== false && file_put_contents($imagePath5, $imageDecoded5) &&
            $imageDecoded6 !== false && file_put_contents($imagePath6, $imageDecoded6)) {
            
          
            $stmt = $pdo->prepare('UPDATE steps SET image5 = :imagePath5, image6 = :imagePath6, step = :finalStep WHERE id = :id');
            $finalStep = 'Завершено'; 
            $stmt->bindParam(':imagePath5', $imagePath5, PDO::PARAM_STR);
            $stmt->bindParam(':imagePath6', $imagePath6, PDO::PARAM_STR);
            $stmt->bindParam(':finalStep', $finalStep, PDO::PARAM_STR);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                $sql = "SELECT id_usertg FROM users WHERE username = :username";
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(':username', $tg_nick, PDO::PARAM_STR);
                $stmt->execute();
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
                if ($result) {
                    $chatId_t = $result['id_usertg'];
                } else {
                    echo "User not found.";
                    exit; 
                }
                
                $sql = "SELECT username FROM users WHERE id_usertg = :id_usertg";
                $stmtUser = $pdo->prepare($sql);
                $stmtUser->bindParam(':id_usertg', $id_usertg, PDO::PARAM_INT);
                $stmtUser->execute();
                $user = $stmtUser->fetch(PDO::FETCH_ASSOC);
    
             
                $chatId = $chatId_t;
                $dealNumber = $id;
                $productName = $Product_name; 
                $userName = $user["username"];
                $userHandle = $user["username"]; 
    
                $result = sendTelegramMessage_final($chatId, $dealNumber, $productName, $userName, $userHandle);
                
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