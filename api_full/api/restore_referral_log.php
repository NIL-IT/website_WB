<?php
include 'db.php';

$logDir = '/var/www/test_bot/logs/';
$userLogs = glob($logDir . 'referral_reset_user_*.log');
$tableLogs = glob($logDir . 'referrals_reset_*.log');

// Сортировка по времени (новые сверху)
usort($userLogs, function($a, $b) { return strcmp($b, $a); });
usort($tableLogs, function($a, $b) { return strcmp($b, $a); });

$message = '';
$diffs = [];
$showConfirm = false;
$restoreType = $_POST['restore_type'] ?? '';
$selectedLog = $_POST['logfile'] ?? '';

function formatLogDate($filename, $type) {
    if ($type === 'user' && preg_match('/_(\d{8}_\d{6})\.log$/', $filename, $m)) {
        $dt = DateTime::createFromFormat('Ymd_His', $m[1]);
        return $dt ? $dt->format('d.m.Y H:i:s') : '';
    }
    if ($type === 'table' && preg_match('/_(\d{8}_\d{6})\.log$/', $filename, $m)) {
        $dt = DateTime::createFromFormat('Ymd_His', $m[1]);
        return $dt ? $dt->format('d.m.Y H:i:s') : '';
    }
    return '';
}

// Получить username по id_usertg
function getUsername($pdo, $id_usertg) {
    $stmt = $pdo->prepare("SELECT username FROM users WHERE id_usertg = ?");
    $stmt->execute([$id_usertg]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row && $row['username'] ? $row['username'] : '';
}

// Первый этап: показать различия
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['restore_type'], $_POST['logfile']) && !isset($_POST['confirm_restore'])) {
    $restoreType = $_POST['restore_type'];
    $selectedLog = $_POST['logfile'];

    if ($restoreType === 'user' && in_array($selectedLog, $userLogs)) {
        $data = json_decode(file_get_contents($selectedLog), true);
        if ($data && isset($data['id_usertg'])) {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("SELECT * FROM referrals WHERE id_usertg = ?");
            $stmt->execute([$data['id_usertg']]);
            $current = $stmt->fetch(PDO::FETCH_ASSOC);
            $diff = [];
            foreach (['score', 'invited'] as $field) {
                if (isset($data[$field]) && isset($current[$field]) && $data[$field] != $current[$field]) {
                    $diff[$field] = ['old' => $current[$field], 'new' => $data[$field]];
                }
            }
            if ($diff) {
                $username = getUsername($pdo, $data['id_usertg']);
                $diffs[] = [
                    'id_usertg' => $data['id_usertg'],
                    'username' => $username,
                    'fields' => $diff
                ];
                $showConfirm = true;
            } else {
                $message = "Нет изменений для восстановления.";
            }
        } else {
            $message = "Некорректный формат лога.";
        }
    } elseif ($restoreType === 'table' && in_array($selectedLog, $tableLogs)) {
        $data = json_decode(file_get_contents($selectedLog), true);
        if (is_array($data)) {
            $pdo = getDbConnection();
            foreach ($data as $row) {
                if (isset($row['id_usertg'])) {
                    $stmt = $pdo->prepare("SELECT * FROM referrals WHERE id_usertg = ?");
                    $stmt->execute([$row['id_usertg']]);
                    $current = $stmt->fetch(PDO::FETCH_ASSOC);
                    $diff = [];
                    foreach (['score', 'invited'] as $field) {
                        if (isset($row[$field]) && isset($current[$field]) && $row[$field] != $current[$field]) {
                            $diff[$field] = ['old' => $current[$field], 'new' => $row[$field]];
                        }
                    }
                    if ($diff) {
                        $username = getUsername($pdo, $row['id_usertg']);
                        $diffs[] = [
                            'id_usertg' => $row['id_usertg'],
                            'username' => $username,
                            'fields' => $diff
                        ];
                    }
                }
            }
            if ($diffs) {
                $showConfirm = true;
            } else {
                $message = "Нет изменений для восстановления.";
            }
        } else {
            $message = "Некорректный формат лога таблицы.";
        }
    } else {
        $message = "Файл не найден или выбран неверный тип восстановления.";
    }
}

// Второй этап: подтверждение и применение изменений
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['confirm_restore'], $_POST['restore_type'], $_POST['logfile'])) {
    $restoreType = $_POST['restore_type'];
    $selectedLog = $_POST['logfile'];
    $logChangeFile = $logDir . 'restore_changes_' . date('Ymd_His') . '.log';
    $changes = [];
    if ($restoreType === 'user' && in_array($selectedLog, $userLogs)) {
        $data = json_decode(file_get_contents($selectedLog), true);
        if ($data && isset($data['id_usertg'])) {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("SELECT * FROM referrals WHERE id_usertg = ?");
            $stmt->execute([$data['id_usertg']]);
            $current = $stmt->fetch(PDO::FETCH_ASSOC);
            $diff = [];
            foreach (['score', 'invited'] as $field) {
                if (isset($data[$field]) && isset($current[$field]) && $data[$field] != $current[$field]) {
                    $diff[$field] = ['old' => $current[$field], 'new' => $data[$field]];
                }
            }
            if ($diff) {
                $stmt = $pdo->prepare("UPDATE referrals SET score = ?, invited = ? WHERE id_usertg = ?");
                $stmt->execute([
                    $data['score'] ?? 0,
                    $data['invited'] ?? 0,
                    $data['id_usertg']
                ]);
                $username = getUsername($pdo, $data['id_usertg']);
                $changes[] = [
                    'id_usertg' => $data['id_usertg'],
                    'username' => $username,
                    'fields' => $diff
                ];
                $message = "Данные успешно восстановлены для пользователя id_usertg: " . htmlspecialchars($data['id_usertg']);
            } else {
                $message = "Нет изменений для восстановления.";
            }
        } else {
            $message = "Некорректный формат лога.";
        }
    } elseif ($restoreType === 'table' && in_array($selectedLog, $tableLogs)) {
        $data = json_decode(file_get_contents($selectedLog), true);
        if (is_array($data)) {
            $pdo = getDbConnection();
            foreach ($data as $row) {
                if (isset($row['id_usertg'])) {
                    $stmt = $pdo->prepare("SELECT * FROM referrals WHERE id_usertg = ?");
                    $stmt->execute([$row['id_usertg']]);
                    $current = $stmt->fetch(PDO::FETCH_ASSOC);
                    $diff = [];
                    foreach (['score', 'invited'] as $field) {
                        if (isset($row[$field]) && isset($current[$field]) && $row[$field] != $current[$field]) {
                            $diff[$field] = ['old' => $current[$field], 'new' => $row[$field]];
                        }
                    }
                    if ($diff) {
                        $stmt = $pdo->prepare("UPDATE referrals SET score = ?, invited = ? WHERE id_usertg = ?");
                        $stmt->execute([
                            $row['score'] ?? 0,
                            $row['invited'] ?? 0,
                            $row['id_usertg']
                        ]);
                        $username = getUsername($pdo, $row['id_usertg']);
                        $changes[] = [
                            'id_usertg' => $row['id_usertg'],
                            'username' => $username,
                            'fields' => $diff
                        ];
                    }
                }
            }
            if ($changes) {
                $message = "Данные успешно восстановлены для всей таблицы referrals.";
            } else {
                $message = "Нет изменений для восстановления.";
            }
        } else {
            $message = "Некорректный формат лога таблицы.";
        }
    } else {
        $message = "Файл не найден или выбран неверный тип восстановления.";
    }
    // Логируем изменения
    if ($changes) {
        file_put_contents($logChangeFile, json_encode($changes, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Восстановление рейтинга из лога</title>
    <style>
        body { font-size: 1.2em; }
        select, button, label { font-size: 1em; }
        table { border-collapse: collapse; margin-top: 1em; }
        th, td { border: 1px solid #ccc; padding: 0.4em 0.8em; }
        .diff-table { margin-bottom: 1em; }
    </style>
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

    <?php if ($showConfirm && $diffs): ?>
        <form method="post">
            <input type="hidden" name="restore_type" value="<?= htmlspecialchars($restoreType) ?>">
            <input type="hidden" name="logfile" value="<?= htmlspecialchars($selectedLog) ?>">
            <input type="hidden" name="confirm_restore" value="1">
            <div>
                <b>Будут внесены следующие изменения:</b>
                <?php foreach ($diffs as $diff): ?>
                    <table class="diff-table">
                        <tr>
                            <th colspan="4">
                                id_usertg: <?= htmlspecialchars($diff['id_usertg']) ?>
                                <?php if ($diff['username']): ?>
                                    | username: <?= htmlspecialchars($diff['username']) ?>
                                <?php endif; ?>
                            </th>
                        </tr>
                        <tr>
                            <th>Поле</th>
                            <th>Было</th>
                            <th>Станет</th>
                        </tr>
                        <?php foreach ($diff['fields'] as $field => $change): ?>
                        <tr>
                            <td><?= htmlspecialchars($field) ?></td>
                            <td><?= htmlspecialchars($change['old']) ?></td>
                            <td><?= htmlspecialchars($change['new']) ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </table>
                <?php endforeach; ?>
            </div>
            <button type="submit">Подтвердить восстановление</button>
            <button type="button" onclick="window.location.href=window.location.href;">Отмена</button>
        </form>
    <?php else: ?>
    <form method="post">
        <label for="restore_type">Тип восстановления:</label>
        <select name="restore_type" id="restore_type" onchange="updateLogOptions()" required>
            <option value="">-- Выберите тип --</option>
            <option value="user" <?= $restoreType === 'user' ? 'selected' : '' ?>>Для одного пользователя</option>
            <option value="table" <?= $restoreType === 'table' ? 'selected' : '' ?>>Для всей таблицы</option>
        </select>
        <br><br>
        <div id="user_logs" style="display:<?= $restoreType === 'user' ? '' : 'none' ?>;">
            <label for="user_logfile">Выберите лог пользователя:</label>
            <select name="logfile" id="user_logfile">
                <option value="">-- Выберите лог --</option>
                <?php foreach ($userLogs as $log): ?>
                    <option value="<?= htmlspecialchars($log) ?>" <?= $selectedLog === $log ? 'selected' : '' ?>>
                        <?= basename($log) ?> (<?= formatLogDate($log, 'user') ?>)
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        <div id="table_logs" style="display:<?= $restoreType === 'table' ? '' : 'none' ?>;">
            <label for="table_logfile">Выберите лог таблицы:</label>
            <select name="logfile" id="table_logfile">
                <option value="">-- Выберите лог --</option>
                <?php foreach ($tableLogs as $log): ?>
                    <option value="<?= htmlspecialchars($log) ?>" <?= $selectedLog === $log ? 'selected' : '' ?>>
                        <?= basename($log) ?> (<?= formatLogDate($log, 'table') ?>)
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        <br>
        <button type="submit">Восстановить</button>
    </form>
    <?php endif; ?>
    <script>
        updateLogOptions();
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
