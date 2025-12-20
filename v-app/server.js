const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/api/health', (req, res) => {
    res.json({ status: 'Vulnerable skeleton running' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Vulnerable server started on port ${PORT}`);
});
