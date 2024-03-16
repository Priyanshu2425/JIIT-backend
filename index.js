require('dotenv').config();
const express = require('express');
const cors = require('cors')
const router = express.Router();
const { UserRouter } = require('./routes/userRoutes');


const app = express();

app.use(cors());
app.use(express.json());

app.use('/user', UserRouter);

const PORT = 3000;
app.listen(PORT, ()=>{
    console.log("Server started on PORT "+ PORT);
})