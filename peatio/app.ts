import express from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import cors from "cors";

const prisma = new PrismaClient();

// rest of the code remains same
const app = express();
//To allow cross-origin requests
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
const PORT = process.env.PORT || 4000;
interface PeatioData {
  Employee_Number: number;
  idEmployee: number;
  Last_Name: string;
  First_Name: string;
  SSN: string;
  Gender: number;
  Shareholder_Status: boolean;
  Benefit_Plans: number;
  Ethnicity: string;
  Vacations_Days: number;
  Salary: number;
}
app.post("/api/peatio/create", async (req, res) => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/hr/get/employee"
    );
    const personals = [...response.data];
    const data = [...req.body];
    const peatios: PeatioData[] = personals.map((personal) => {
      const employee = data.find(
        (d) => d.Employee_Number === personal.Employee_ID
      );
      return {
        Employee_Number: personal.Employee_ID,
        idEmployee: personal.Employee_ID,
        Last_Name: employee.Last_Name,
        First_Name: employee.First_Name,
        SSN: employee.SSN,
        Gender: personal.Gender === false ? 0 : 1,
        Shareholder_Status: personal.Gender,
        Benefit_Plans: personal.Benefit_Plans
          ? personal.Benefit_Plans
          : undefined,
        Ethnicity: personal.Ethnicity,
        Vacations_Days: employee.Vacations_Days,
        Salary: employee.Salary,
      };
    });
    await prisma.statistic.deleteMany();
    await prisma.statistic.createMany({
      data: peatios,
    });
    res.status(200).json("Insert data to peatio success");
  } catch (error) {
    console.log(error.message);

    res.status(401).json({
      msg: "Insert data to peatio fail",
      error: error.message,
    });
  }
});

app.put("/api/peatio/update/employee", async (req, res) => {
  try {
    const { Employee_ID, Last_Name, First_Name, Gender } = req.body;
    await prisma.statistic.update({
      where: {
        Employee_Number: Employee_ID,
      },
      data: {
        Last_Name: Last_Name,
        First_Name: First_Name,
        Gender: Gender,
      },
    });
    res.status(200).json("Update employee success");
  } catch (error) {
    res.status(401).json({
      msg: "Update peatio fail",
      error: error.message,
    });
  }
});

app.get("/api/peatio/statistic", async (req, res) => {
  try {
    const statistics = await prisma.statistic.findMany();
    res.status(200).json([...statistics]);
  } catch (error) {
    res.status(401).json({
      msg: "Fetch peatio fail",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`⚡️[Peatio]: Server is running at https://localhost:${PORT}`);
});
