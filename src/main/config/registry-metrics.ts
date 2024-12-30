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

register.registerMetric(httpRequestDurationSeconds);
export {register, httpRequestDurationSeconds}