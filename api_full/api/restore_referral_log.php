<?php
include 'db.php';

$logDir = '/var/www/test_bot/logs/';
$userLogs = glob($logDir . 'referral_reset_user_*.log');
$tableLogs = glob($logDir . 'referrals_reset_*.log');
$restoredLogs = glob($logDir . 'restore_changes_*.log');

// Сортировка по времени (новые сверху)
usort($userLogs, function($a, $b) { return strcmp($b, $a); });
usort($tableLogs, function($a, $b) { return strcmp($b, $a); });
usort($restoredLogs, function($a, $b) { return strcmp($b, $a); });

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

// Получить топ-таблицу (аналогично top_updater.php)
function getTopTable($pdo) {
    $stmt = $pdo->prepare("
        SELECT r.id_usertg, r.score, r.invited, u.username
        FROM referrals r
        LEFT JOIN users u ON r.id_usertg = u.id_usertg
        WHERE r.score > 0
    ");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    usort($rows, function($a, $b) {
        if ($a['score'] != $b['score']) {
            return $b['score'] - $a['score'];
        }
        if ($a['invited'] != $b['invited']) {
            return $b['invited'] - $a['invited'];
        }
        return strcmp(mb_strtolower($a['username']), mb_strtolower($b['username']));
    });

    $table = [["Место", "Имя пользователя", "Очки", "Приглашённые"]];
    $medals = [1 => "🥇", 2 => "🥈", 3 => "🥉"];
    $place = 1;
    foreach ($rows as $row) {
        $place_str = isset($medals[$place]) ? $place . $medals[$place] : (string)$place;
        $table[] = [
            $place_str,
            $row['username'],
            $row['score'],
            $row['invited']
        ];
        $place++;
    }
    return $table;
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
    // Для restore_changes (теперь можно применить)
    } elseif ($restoreType === 'restored' && in_array($selectedLog, $restoredLogs)) {
        $data = json_decode(file_get_contents($selectedLog), true);
        if (is_array($data)) {
            $diffs = $data;
            $showConfirm = true;
            $message = "Вы можете применить эти восстановленные изменения повторно.";
        } else {
            $message = "Некорректный формат лога изменений.";
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
    } elseif ($restoreType === 'restored' && in_array($selectedLog, $restoredLogs)) {
        $data = json_decode(file_get_contents($selectedLog), true);
        if (is_array($data)) {
            $pdo = getDbConnection();
            foreach ($data as $row) {
                if (isset($row['id_usertg']) && isset($row['fields'])) {
                    $stmt = $pdo->prepare("SELECT * FROM referrals WHERE id_usertg = ?");
                    $stmt->execute([$row['id_usertg']]);
                    $current = $stmt->fetch(PDO::FETCH_ASSOC);
                    $diff = [];
                    foreach ($row['fields'] as $field => $change) {
                        if (isset($current[$field]) && $current[$field] != $change['new']) {
                            $diff[$field] = ['old' => $current[$field], 'new' => $change['new']];
                        }
                    }
                    if ($diff) {
                        // Применяем только если есть отличия
                        $fieldsToUpdate = [];
                        $params = [];
                        foreach ($diff as $field => $change) {
                            $fieldsToUpdate[] = "$field = ?";
                            $params[] = $change['new'];
                        }
                        $params[] = $row['id_usertg'];
                        $sql = "UPDATE referrals SET " . implode(', ', $fieldsToUpdate) . " WHERE id_usertg = ?";
                        $stmt = $pdo->prepare($sql);
                        $stmt->execute($params);
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
                $message = "Изменения из лога успешно применены.";
            } else {
                $message = "Нет изменений для применения.";
            }
        } else {
            $message = "Некорректный формат лога изменений.";
        }
    } else {
        $message = "Файл не найден или выбран неверный тип восстановления.";
    }
    // Логируем изменения
    if ($changes) {
        file_put_contents($logChangeFile, json_encode($changes, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    }

    // Вызов top_updater.php после восстановления рейтинга
    $topUpdaterPath = dirname(__DIR__) . '/updater/top_updater.php';
    if (file_exists($topUpdaterPath)) {
        include_once $topUpdaterPath;
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
        .top-table { margin-bottom: 2em; background: #f9f9f9; }
    </style>
    <script>
    function updateLogOptions() {
        var type = document.getElementById('restore_type').value;
        document.getElementById('user_logs').style.display = (type === 'user') ? '' : 'none';
        document.getElementById('table_logs').style.display = (type === 'table') ? '' : 'none';
        document.getElementById('restored_logs').style.display = (type === 'restored') ? '' : 'none';
    }
    </script>
</head>
<body>
    <h2>Восстановление рейтинга из лога</h2>
    <?php if ($message): ?>
        <p><b><?= htmlspecialchars($message) ?></b></p>
    <?php endif; ?>

    <?php if ($showConfirm && $diffs): ?>
        <?php
        // Показываем топ-таблицу перед подтверждением (до изменений)
        $pdo = getDbConnection();
        $topTable = getTopTable($pdo);

        // Получить топ после изменений (эмулируем изменения в памяти)
        $referrals = [];
        $stmt = $pdo->query("SELECT * FROM referrals");
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $referrals[$row['id_usertg']] = $row;
        }
        // Применяем изменения из $diffs к копии данных
        foreach ($diffs as $diff) {
            $id = $diff['id_usertg'];
            if (isset($referrals[$id])) {
                foreach ($diff['fields'] as $field => $change) {
                    $referrals[$id][$field] = $change['new'];
                }
            }
        }
        // Формируем топ после изменений
        $rowsAfter = [];
        foreach ($referrals as $row) {
            // Получаем username
            $row['username'] = getUsername($pdo, $row['id_usertg']);
            $rowsAfter[] = $row;
        }
        usort($rowsAfter, function($a, $b) {
            if ($a['score'] != $b['score']) {
                return $b['score'] - $a['score'];
            }
            if ($a['invited'] != $b['invited']) {
                return $b['invited'] - $a['invited'];
            }
            return strcmp(mb_strtolower($a['username']), mb_strtolower($b['username']));
        });
        $tableAfter = [["Место", "Имя пользователя", "Очки", "Приглашённые"]];
        $medals = [1 => "🥇", 2 => "🥈", 3 => "🥉"];
        $place = 1;
        foreach ($rowsAfter as $row) {
            if ($row['score'] > 0) {
                $place_str = isset($medals[$place]) ? $place . $medals[$place] : (string)$place;
                $tableAfter[] = [
                    $place_str,
                    $row['username'],
                    $row['score'],
                    $row['invited']
                ];
                $place++;
            }
        }
        ?>
        <div>
            <b>Текущий топ пользователей:</b>
            <table class="top-table">
                <?php foreach ($topTable as $i => $row): ?>
                    <tr>
                        <?php foreach ($row as $cell): ?>
                            <td<?= $i === 0 ? ' style="font-weight:bold;background:#f0f0d0;"' : '' ?>><?= htmlspecialchars($cell) ?></td>
                        <?php endforeach; ?>
                    </tr>
                <?php endforeach; ?>
            </table>
        </div>
        <div>
            <b>Топ пользователей после применения изменений:</b>
            <table class="top-table">
                <?php foreach ($tableAfter as $i => $row): ?>
                    <tr>
                        <?php foreach ($row as $cell): ?>
                            <td<?= $i === 0 ? ' style="font-weight:bold;background:#e0ffe0;"' : '' ?>><?= htmlspecialchars($cell) ?></td>
                        <?php endforeach; ?>
                    </tr>
                <?php endforeach; ?>
            </table>
        </div>
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
                                <?php if (!empty($diff['username'])): ?>
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
    <?php elseif ($restoreType === 'restored' && !empty($diffs)): ?>
        <div>
            <b>Восстановленные изменения:</b>
            <?php foreach ($diffs as $diff): ?>
                <table class="diff-table">
                    <tr>
                        <th colspan="4">
                            id_usertg: <?= htmlspecialchars($diff['id_usertg']) ?>
                            <?php if (!empty($diff['username'])): ?>
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
    <?php else: ?>
    <form method="post">
        <label for="restore_type">Тип восстановления:</label>
        <select name="restore_type" id="restore_type" onchange="updateLogOptions()" required>
            <option value="">-- Выберите тип --</option>
            <option value="user" <?= $restoreType === 'user' ? 'selected' : '' ?>>Для одного пользователя</option>
            <option value="table" <?= $restoreType === 'table' ? 'selected' : '' ?>>Для всей таблицы</option>
            <option value="restored" <?= $restoreType === 'restored' ? 'selected' : '' ?>>Восстановленные изменения</option>
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
        <div id="restored_logs" style="display:<?= $restoreType === 'restored' ? '' : 'none' ?>;">
            <label for="restored_logfile">Выберите лог изменений:</label>
            <select name="logfile" id="restored_logfile">
                <option value="">-- Выберите лог --</option>
                <?php foreach ($restoredLogs as $log): ?>
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
            document.getElementById('user_logfile').setAttribute('name', type === 'user' ? 'logfile' : 'logfile_disabled');
            document.getElementById('table_logfile').setAttribute('name', type === 'table' ? 'logfile' : 'logfile_disabled');
            document.getElementById('restored_logfile').setAttribute('name', type === 'restored' ? 'logfile' : 'logfile_disabled');
        });
    </script>
</body>
</html>
