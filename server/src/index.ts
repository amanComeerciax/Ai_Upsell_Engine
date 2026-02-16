import app from './app';

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`🚀 Velocity AI Server running on port ${PORT}`);
    console.log(`📡 Intelligence Core: http://localhost:${PORT}/api/v1`);
});
