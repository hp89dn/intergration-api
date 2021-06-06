import express from "express";
import {PrismaClient} from "@prisma/client";
import axios from 'axios';

const prisma = new PrismaClient();

// rest of the code remains same
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4000;
interface PeatioData {
    Employee_Number: number,
    idEmployee: number,
    Last_Name: string,
    First_Name: string,
    SSN: string,
    Gender: boolean,
    Shareholder_Status: boolean,
    Benefit_Plans: number,
    Ethnicity: string,
    Vacations_Days: number,
    Salary: number
}
app.post("/api/peatio/create", async (req,res) => {
    try {
        const data: PeatioData[] = req.body;
        await  prisma.statistic.createMany({
            data: data
        });
        res.status(200).json("Insert data to peatio success");
    } catch (error) {
        res.status(401).json({
            msg: "Insert data to peatio fail",
            error: error.message
        })
    }

})

app.listen(PORT, () => {
    console.log(`⚡️[Peatio]: Server is running at https://localhost:${PORT}`);
});
