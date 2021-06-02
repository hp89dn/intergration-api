import express from "express";
import { PrismaClient } from "@prisma/client";
import NP from "number-precision";
const prisma = new PrismaClient();

// rest of the code remains same
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8000;
app.get("/api/payroll/employee", async (req, res) => {
  const employees = await prisma.employee.findMany({
    include: {
      PayRate: true,
    },
  });
  const employeesInfo = employees.map((employee) => {
    const pay_amount = employee.PayRate
      ? Number(employee.PayRate.Pay_Amount)
      : 0;
    const pay_rate = employee.PayRate ? Number(employee.Pay_Rate) : 0;
    const tax_percent = employee.PayRate
      ? Number(employee.PayRate.Tax_Percentage)
      : 0;
    const Salary = Math.abs(
      NP.times(pay_amount, NP.minus(pay_rate, tax_percent))
    );
    return {
      Employee_Number: employee.Employee_Number,
      idEmployee: employee.idEmployee,
      Last_Name: employee.Last_Name,
      First_Name: employee.First_Name,
      SSN: employee.SSN,
      Vacation_Days: employee.Vacation_Days,
      Salary: Salary,
    };
  });
  res.status(200).json([...employeesInfo]);
});

app.put("/api/payroll/employee", async (req, res) => {
  try {
    const { Employee_Number, Last_Name, First_Name, SSN } = req.body;
    await prisma.employee.update({
      where: {
        Employee_Number: Employee_Number,
      },
      data: {
        Last_Name: Last_Name,
        First_Name: First_Name,
        SSN: SSN,
      },
    });

    res.status(200).json();
  } catch (error) {
    res.status(401).json(error.message);
  }
});

app.post("/api/payroll/create/employee", async (req, res) => {
  try {
    const { Employee_Number, Last_Name, First_Name, SSN, idEmployee } =
      req.body;
    await prisma.employee.create({
      data: {
        Employee_Number: Employee_Number,
        First_Name: First_Name,
        Last_Name: Last_Name,
        SSN: SSN,
        idEmployee: idEmployee,
      },
    });
    res.status(200).json("Add new employee success");
  } catch (error) {
    res.status(401).json(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
