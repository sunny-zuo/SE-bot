const express = require('express');
const app = express();
const port = process.env.SERVER_PORT || 5000;

app.get('/', (req, res) => {
    res.send('hello world');
});

app.listen(port, () => {
    console.log(`Express server running on port ${port}`);
});