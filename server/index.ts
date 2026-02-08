import './lib/env'; // Validate environment variables on startup
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { corsMiddleware } from './middleware/cors';
import { jsonParseErrorHandler } from './middleware/jsonParseError';
import { validateUuidParams } from './middleware/validateParams';
import { errorHandler } from './middleware/errorHandler';
import { Request, Response, NextFunction } from 'express';

// Import routes
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import organisationsRoutes from './routes/organisations.routes';
import usersRoutes from './routes/users.routes';
import projectsRoutes from './routes/projects.routes';
import dataSourcesRoutes from './routes/dataSources.routes';
import canonicalSchemasRoutes from './routes/canonicalSchemas.routes';
import processingPipelinesRoutes from './routes/processingPipelines.routes';
import processingJobsRoutes from './routes/processingJobs.routes';
import datasetsRoutes from './routes/datasets.routes';
import apiConnectorsRoutes from './routes/apiConnectors.routes';
import projectDataSourcesRoutes from './routes/projectDataSources.routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware stack (order matters!)
// 1. CORS
app.use(corsMiddleware);

// 2. JSON body parser with parse error handler
app.use(express.json());
app.use(jsonParseErrorHandler);

// 3. UUID parameter validation
app.use(validateUuidParams);

// 4. Routes
app.use(healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/organisations', organisationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/data-sources', dataSourcesRoutes);
app.use('/api/canonical-schemas', canonicalSchemasRoutes);
app.use('/api/processing-pipelines', processingPipelinesRoutes);
app.use('/api', processingJobsRoutes);
app.use('/api', datasetsRoutes);
app.use('/api/api-connectors', apiConnectorsRoutes);
app.use('/api', projectDataSourcesRoutes);

// 5. Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// 6. Global error handler (must be last)
// 4-parameter middleware: (err, req, res, next)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  return errorHandler(err, req, res, next);
});

// Server binding
const PORT = process.env.NODE_ENV === 'production' ? parseInt(process.env.PORT || '5000', 10) : 3001;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
