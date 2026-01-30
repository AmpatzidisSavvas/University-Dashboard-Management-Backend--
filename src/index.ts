import express from 'express';
import subjectRouter from './routes/subjects';
import cors from 'cors'
import securityMiddleware from './middleware/security';
import { toNodeHandler } from "better-auth/node"
import { auth } from './lib/auth';
import usersRouter from './routes/users';
import classesRouter from './routes/classes';
import departmentsRouter from './routes/departments';

const app = express();
const PORT = 8000;

if (!process.env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL is not set in .env file')
}

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET','POST','PUT','DELETE'],
    credentials: true 
}));

app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

app.use(securityMiddleware);

app.use('/api/subjects', subjectRouter)
app.use('/api/users', usersRouter)
app.use('/api/classes', classesRouter),
app.use("/api/departments", departmentsRouter);

app.get('/', (req, res) => {
    res.send('Classroom API');
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});