require('dotenv').config();

const app = require('./app');
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🌾 AgroDirecto API corriendo en puerto ${PORT}`);
    console.log(`📍 http://localhost:${PORT}/api/health`);
});
