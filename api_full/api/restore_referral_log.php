<?php
include 'db.php';

$logDir = '/var/www/test_bot/logs/';
$userLogs = glob($logDir . 'referral_reset_user_*.log');
$tableLogs = glob($logDir . 'referrals_reset_*.log');

// Сортировка по времени (новые сверху)
usort($userLogs, function($a, $b) { return strcmp($b, $a); });
usort($tableLogs, function($a, $b) { return strcmp($b, $a); });

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['restore_type'], $_POST['logfile'])) {
    $restoreType = $_POST['restore_type'];
    $selectedLog = $_POST['logfile'];

    if ($restoreType === 'user' && in_array($selectedLog, $userLogs)) {
        $data = json_decode(file_get_contents($selectedLog), true);
        if ($data && isset($data['id_usertg'])) {
            try {
                $pdo = getDbConnection();
                $stmt = $pdo->prepare("UPDATE referrals SET score = ?, invited = ? WHERE id_usertg = ?");
                $stmt->execute([
                    $data['score'] ?? 0,
                    $data['invited'] ?? 0,
                    $data['id_usertg']
                ]);
                $message = "Данные успешно восстановлены для пользователя id_usertg: " . htmlspecialchars($data['id_usertg']);
            } catch (Exception $e) {
                $message = "Ошибка при восстановлении: " . $e->getMessage();
            }
        } else {
            $message = "Некорректный формат лога.";
        }
    } elseif ($restoreType === 'table' && in_array($selectedLog, $tableLogs)) {
        $data = json_decode(file_get_contents($selectedLog), true);
        if (is_array($data)) {
            try {
                $pdo = getDbConnection();
                foreach ($data as $row) {
                    if (isset($row['id_usertg'])) {
                        $stmt = $pdo->prepare("UPDATE referrals SET score = ?, invited = ? WHERE id_usertg = ?");
                        $stmt->execute([
                            $row['score'] ?? 0,
                            $row['invited'] ?? 0,
                            $row['id_usertg']
                        ]);
                    }
                }
                $message = "Данные успешно восстановлены для всей таблицы referrals.";
            } catch (Exception $e) {
                $message = "Ошибка при восстановлении таблицы: " . $e->getMessage();
            }
        } else {
            $message = "Некорректный формат лога таблицы.";
        }
    } else {
        $message = "Файл не найден или выбран неверный тип восстановления.";
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Восстановление рейтинга из лога</title>
    <script>
    function updateLogOptions() {
        var type = document.getElementById('restore_type').value;
        document.getElementById('user_logs').style.display = (type === 'user') ? '' : 'none';
        document.getElementById('table_logs').style.display = (type === 'table') ? '' : 'none';
    }
    </script>
</head>
<body>
    <h2>Восстановление рейтинга из лога</h2>
    <?php if ($message): ?>
        <p><b><?= htmlspecialchars($message) ?></b></p>
    <?php endif; ?>
    <form method="post">
        <label for="restore_type">Тип восстановления:</label>
        <select name="restore_type" id="restore_type" onchange="updateLogOptions()" required>
            <option value="">-- Выберите тип --</option>
            <option value="user">Для одного пользователя</option>
            <option value="table">Для всей таблицы</option>
        </select>
        <br><br>
        <div id="user_logs" style="display:none;">
            <label for="user_logfile">Выберите лог пользователя:</label>
            <select name="logfile" id="user_logfile">
                <option value="">-- Выберите лог --</option>
                <?php foreach ($userLogs as $log): ?>
                    <option value="<?= htmlspecialchars($log) ?>"><?= basename($log) ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <div id="table_logs" style="display:none;">
            <label for="table_logfile">Выберите лог таблицы:</label>
            <select name="logfile" id="table_logfile">
                <option value="">-- Выберите лог --</option>
                <?php foreach ($tableLogs as $log): ?>
                    <option value="<?= htmlspecialchars($log) ?>"><?= basename($log) ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <br>
        <button type="submit">Восстановить</button>
    </form>
    <script>
        updateLogOptions();
        // Автоматически обновить селекты при возврате на страницу
        document.getElementById('restore_type').addEventListener('change', function() {
            var type = this.value;
            if (type === 'user') {
                document.getElementById('user_logfile').setAttribute('name', 'logfile');
                document.getElementById('table_logfile').setAttribute('name', 'logfile_disabled');
            } else if (type === 'table') {
                document.getElementById('table_logfile').setAttribute('name', 'logfile');
                document.getElementById('user_logfile').setAttribute('name', 'logfile_disabled');
            } else {
                document.getElementById('user_logfile').setAttribute('name', 'logfile_disabled');
                document.getElementById('table_logfile').setAttribute('name', 'logfile_disabled');
            }
        });
    </script>
</body>
</html>
