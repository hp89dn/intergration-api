import express from "express";
import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const app = express();
app.use(express.json());
// rest of the code remains same
const PORT = process.env.PORT || 5000;

app.get("/api/hr/get/employee", async (req, res) => {
  try {
    const personals = await prisma.personal.findMany();
    res.status(200).json(personals);
  } catch (error) {
    res.status(401).json(error.message);
  }
});

app.post("/api/hr/create/employee", async (req, res) => {
  try {
    const {
      Employee_ID,
      First_Name,
      Last_Name,
      Gender,
      Email,
      Phone_Number,
      Social_Security_Number,
      Shareholder_Status,
    } = req.body;

    const personal = await prisma.personal.create({
      data: {
        Employee_ID: Employee_ID,
        First_Name: First_Name,
        Last_Name: Last_Name,
        Gender: Gender,
        Email: Email,
        Phone_Number: Phone_Number,
        Social_Security_Number: Social_Security_Number,
        Shareholder_Status: Shareholder_Status,
      },
    });
    const employment = await prisma.employment.create({
      data: {
        Employee_ID: Employee_ID,
        Employment_Status: "active",
        Hire_Date: new Date(),
        Workers_Comp_Code: (Math.random() * 100 + 1).toString(),
        Termination_Date: new Date(),
        Rehire_Date: new Date(),
        Last_Review_Date: new Date(),
      },
    });
    res.status(200).json({
      personal: personal,
      employment: employment,
    });
  } catch (error) {
    console.log(error);

    res.status(401).json(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
