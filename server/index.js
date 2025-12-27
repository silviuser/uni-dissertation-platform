import express from 'express';
import env from 'dotenv';
import DB_Init from './entities/DB_init.js';
import createDBRouter from './routes/createDBRouter.js';
import StudentRouter from './routes/StudentRouter.js';
import ProfessorRouter from './routes/ProfessorRouter.js';
import RequestRouter from './routes/RequestRouter.js';
import SessionRouter from './routes/SessionRouter.js';
import AuthRouter from './routes/AuthRouter.js';

env.config();

let app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

DB_Init();

app.use('/api', createDBRouter);
app.use('/api', AuthRouter); // /api/login
app.use('/api/students', StudentRouter);
app.use('/api/professors', ProfessorRouter);
app.use('/api/requests', RequestRouter);
app.use('/api/sessions', SessionRouter);

let PORT = process.env.PORT || 9000;

app.listen(PORT);
console.log(`Server is running on port ${PORT}`);