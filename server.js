const express = require('express');
const app = express();
app.use(
  sass.middleware({
    src: __dirname + '/',
    dest: __dirname + '/',
    debug: true,
  })
);
app.use(express.static('index.html'));
app.use(express.static('scripts.js'));
app.use(express.static('styles.css'));

app.listen(3000);
