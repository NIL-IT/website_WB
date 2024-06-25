const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'build', 'index.html');

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  // Заменяем <title> и добавляем мета-теги
  const updatedContent = data.replace(
    /<title>.*<\/title>/,
    `<script src="https://telegram.org/js/telegram-web-app.js"></script>`
  );

  fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Script have been updated in index.html');
  });
});