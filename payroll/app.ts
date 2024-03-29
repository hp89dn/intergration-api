import express from "express";
import { PrismaClient } from "@prisma/client";
import NP from "number-precision";
import axios from "axios";
import cors from "cors";

const prisma = new PrismaClient();
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

const PORT = process.env.PORT || 7000;

app.get("/api/payroll/employee", async (req, res) => {
  try {
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
        PayRates_id: employee.PayRates_id,
        Tax_Percentage: tax_percent,
        Pay_Amount: pay_amount,
        SSN: employee.SSN,
        Pay_Rate: employee.Pay_Rate,
        Paid_To_Date: employee.Paid_To_Date,
        Paid_Last_Year: employee.Paid_Last_Year,
        Vacation_Days: employee.Vacation_Days,
        Salary: Salary,
      };
    });

    res
      .status(200)
      .json([...employeesInfo].sort((a, b) => a.Salary - b.Salary));
  } catch (err) {
    res.status(401).json({
      msg: "[Fail] Fetch employees fail",
      error: err.message,
    });
  }
});

app.put("/api/payroll/employee", async (req, res) => {
  try {
    const {
      Employee_ID,
      Pay_Rate,
      Paid_To_Date,
      Paid_Last_Year,
      Vacation_Days,
      PayRates_id,
    } = req.body;

    await prisma.employee.update({
      where: {
        Employee_Number: Number(Employee_ID),
      },
      data: {
        Pay_Rate: String(Pay_Rate),
        Paid_To_Date: Number(Paid_To_Date),
        Paid_Last_Year: Number(Paid_Last_Year),
        Vacation_Days: Number(Vacation_Days),
        PayRates_id: Number(PayRates_id),
      },
    });
    res.status(200).json("[Success] Update employee information successfully");
  } catch (error) {
    console.log(error.message);

    res.status(401).json({
      msg: "[Fail] Update employee information fail",
      error: error.message,
    });
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
    res.status(200).json("[Success] Add new employee success");
  } catch (error) {
    console.log(error.message);
    res.status(401).json(error.message);
  }
});

app.put("/api/payroll/update/employee", async (req, res) => {
  try {
    const { Employee_ID, Last_Name, First_Name } = req.body;

    await prisma.employee.update({
      where: {
        Employee_Number: Employee_ID,
      },
      data: {
        First_Name: First_Name,
        Last_Name: Last_Name,
      },
    });
    res.status(200).json("[Success] Add new employee success");
  } catch (error) {
    console.log(error.message);
    res.status(401).json(error.message);
  }
});

app.post("/api/payroll/create/user", async (req, res) => {
  try {
    const { User_Name, Email, Password } = req.body;
    await prisma.users.create({
      data: {
        User_Name: User_Name,
        Email: Email,
        Password: Password,
      },
    });
    res.status(200).json("Create new user success");
  } catch (error) {
    res.status(401).json(error.message);
  }
});

app.get("/api/payroll/get/users", async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        User_ID: true,
        Email: true,
        User_Name: true,
      },
    });
    res.status(200).json([...users]);
  } catch (error) {
    res.status(401).json(error.message);
  }
});

app.get("/api/payroll/get/payrates", async (req, res) => {
  try {
  } catch (error) {}
});

app.get("/api/payroll/get/user", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.users.findFirst({
      select: {
        User_ID: true,
        Email: true,
        User_Name: true,
      },
      where: {
        Email: email,
      },
    });
    res.status(200).json({ ...user });
  } catch (error) {
    res.status(401).json(error.message);
  }
});

interface Employee {
  Employee_Number: number;
  idEmployee: number;
  Last_Name: string;
  First_Name: string;
  Gender: number;
  Shareholder_Status: number;
  Ethnicity: string;
  Benefit_Plans: number;
}

app.get("/api/payroll/get/peatio-employees", async (req, res) => {
  try {
    const employee = await axios.get(
      "http://localhost:5000/api/hr/get/employee"
    );
    const hrEmployees: Employee[] = employee.data;
    const payrollEmployees = await prisma.employee.findMany({
      include: {
        PayRate: true,
      },
    });
    const peatioEmployees = hrEmployees.map((employee) => {
      const payrollEmployee = payrollEmployees.find(
        (e) => e.Employee_Number === employee.Employee_Number
      ) || {
        PayRate: { Pay_Amount: 0, Tax_Percentage: 0 },
        Pay_Amount: 0,
        Pay_Rate: 0,
        SSN: "",
        Gender: 0,
        Vacation_Days: 0,
      };
      let payAmounts: number;
      payAmounts = payrollEmployee.PayRate
        ? Number(payrollEmployee.PayRate.Pay_Amount)
        : 0;
      const pay_rate = payrollEmployee.PayRate
        ? Number(payrollEmployee.Pay_Rate)
        : 0;
      const tax_percent = payrollEmployee.PayRate
        ? Number(payrollEmployee.PayRate.Tax_Percentage)
        : 0;
      const Salary = Math.abs(
        NP.times(payAmounts, NP.minus(pay_rate, tax_percent))
      );

      return {
        Employee_Number: employee.Employee_Number,
        idEmployee: employee.idEmployee,
        Last_Name: employee.Last_Name,
        First_Name: employee.First_Name,
        SSN: payrollEmployee.SSN,
        Gender: employee.Gender,
        Benefit_Plans: employee.Benefit_Plans,
        Ethnicity: employee.Ethnicity,
        Shareholder_Status: employee.Shareholder_Status,
        Vacation_Days: payrollEmployee.Vacation_Days,
        Salary: Salary,
      };
    });
    await axios.post(
      "http://localhost:4000/api/peatio/create",
      peatioEmployees
    );
    res.status(200).json([...peatioEmployees]);
  } catch (error) {
    res.status(401).json({
      msg: "[ERROR] Get Employees fail",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`⚡️[Payroll]: Server is running at https://localhost:${PORT}`);
});
