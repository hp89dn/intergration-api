import express from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import cors from "cors";
import axios from "axios";
const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ limit: "10mb", extended: true }));

//To allow cross-origin requests
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// rest of the code remains same
const PORT = process.env.PORT || 5000;

app.get("/api/hr/get/employee", async (req, res) => {
  try {
    const personals = await prisma.personal.findMany({
      select: {
        Employee_ID: true,
        Last_Name: true,
        First_Name: true,
        Email: true,
        Gender: true,
        Social_Security_Number: true,
        Shareholder_Status: true,
        Benefit_Plans: true,
        Ethnicity: true,
      },
      orderBy: {
        Last_Name: "asc",
      },
    });
    res.status(200).json(personals);
  } catch (error) {
    res.status(401).json(error.message);
  }
});

app.put("/api/hr/update/employee", async (req, res) => {
  try {
    const { Employee_ID, First_Name, Last_Name, Gender } = req.body;
    await prisma.personal.update({
      where: {
        Employee_ID: Employee_ID,
      },
      data: {
        First_Name: First_Name,
        Last_Name: Last_Name,
        Gender: Gender === 0 ? false : true,
        Employee_ID: Employee_ID,
      },
    });

    await axios.put("http://localhost:7000/api/payroll/update/employee", {
      Employee_ID,
      First_Name,
      Last_Name,
      Gender,
    });
    await axios.put("http://localhost:4000/api/peatio/update/employee", {
      Employee_ID,
      First_Name,
      Last_Name,
      Gender,
    });
    res.status(200).json();
  } catch (error) {
    console.log(error);

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
      Ethnicity,
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
        Ethnicity: Ethnicity,
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
    await axios.post("http://localhost:7000/api/payroll/create/employee", {
      Employee_Number: Employee_ID,
      First_Name: First_Name,
      Last_Name: Last_Name,
      SSN: Social_Security_Number,
      idEmployee: Employee_ID,
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
  console.log(`⚡️[HR]: Server is running at https://localhost:${PORT}`);
});
