import express from 'express';
import 'dotenv/config'

import UserRoutes from './routes/UserRoutes'

const app = express();
const port = process.env.PORT



app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
