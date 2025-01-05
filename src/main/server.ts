import app from './config/app'
import { appRestartsCounter } from './config/registry-metrics'

appRestartsCounter.inc()
app.listen(8080, () => console.log('Server running at http://localhost:8080'))