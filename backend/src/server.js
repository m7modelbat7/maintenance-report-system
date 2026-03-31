const app = require("./app");
const { initializeDatabase } = require("./db/initSchema");

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Backend server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend server:", error.message);
    process.exit(1);
  }
}

startServer();
