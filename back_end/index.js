import express from "express";
import cors from "cors";
import "./config/dotenv.js";
import "express-async-errors";
import clicknext from "./routes/clicknext.js";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json()); // Enable JSON body parsing middleware

// Load clicknext routes
app.use('/clicknexts', clicknext);
app.use(express.urlencoded({ extended: true }));


// Global handling

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
