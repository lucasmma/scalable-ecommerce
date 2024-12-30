import promClient from 'prom-client';

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Create a Histogram to track request durations
const httpRequestDurationSeconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'], // Labels to track
  buckets: [0.1, 0.5, 1, 2.5, 5, 10], // Define buckets for response times
});

const exceptionCounter = new promClient.Counter({
  name: 'http_request_expection_total',
  help: 'Total number of HTTP request expections',
  labelNames: ['method', 'route', 'status_code', 'error'],
});

const securityEventCounter = new promClient.Counter({
  name: 'security_events_total',
  help: 'Count of security-related events',
  labelNames: ['event_type', 'route'],
});

const appRestartsCounter = new promClient.Counter({
  name: 'app_restarts_total',
  help: 'Number of application restarts',
});
// add transaction error counter

register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(exceptionCounter);
register.registerMetric(securityEventCounter);
register.registerMetric(appRestartsCounter);

export { register, httpRequestDurationSeconds, exceptionCounter, securityEventCounter, appRestartsCounter };