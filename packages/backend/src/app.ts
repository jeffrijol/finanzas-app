import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import routes from './routes';
import { ApiResponseHelper } from './utils/apiResponse';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', routes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json(
        ApiResponseHelper.error(message, process.env.NODE_ENV === 'development' ? err : undefined)
    );
});

export default app;
