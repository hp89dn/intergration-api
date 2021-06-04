import express from "express";
import {PrismaClient} from "@prisma/client";
import NP from "number-precision";

const prisma = new PrismaClient();

// rest of the code remains same
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 6000;

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
                SSN: employee.SSN,
                Vacation_Days: employee.Vacation_Days,
                Salary: Salary,
            };
        });
        res.status(200).json([...employeesInfo]);
    } catch (err) {
        res.status(401).json({
            msg: '[Fail] Fetch employees fail',
            error: err.message
        });

    }
});

app.put("/api/payroll/employee", async (req, res) => {
    try {
        const {Employee_Number, Last_Name, First_Name, SSN} = req.body;
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
        res.status(200).json("[Success] Update employee information successfully");
    } catch (error) {
        res.status(401).json({
            msg: '[Fail] Update employee information fail',
            error: error.message
        });
    }
});

app.post("/api/payroll/create/employee", async (req, res) => {
    try {
        const {Employee_Number, Last_Name, First_Name, SSN, idEmployee} =
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
        console.log(error)
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
        Password: Password
      }
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
        User_Name: true
      }
    });
    res.status(200).json([...users]);
  } catch (error) {
    res.status(401).json(error.message);
  }
});

app.get("/api/payroll/get/user", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.users.findFirst({
      select: {
        User_ID: true,
        Email: true,
        User_Name: true
      },
      where: {
        Email: email
      }
    });
    res.status(200).json({ ...user });
  } catch (error) {
    res.status(401).json(error.message);
  }
});

app.post("/api/payroll/save/salary" , async(req,res) => {
    try {

    } catch {

    }
});

app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
