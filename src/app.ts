import express, { Application } from "express";
import bodyParser from "body-parser";
import emailVerifyRoutes from "./routes/emailVerifyRoutes";
import instantlyRoutes from "./routes/instantlyRoutes";

require("dotenv").config();

const app: Application = express();

app.use(bodyParser.json());

app.use("/", emailVerifyRoutes);
app.use("/", instantlyRoutes);

const PORT: number = parseInt(process.env.PORT as string, 10) || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
