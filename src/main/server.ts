import app from './config/app'
import { appRestartsCounter } from './config/registry-metrics'

appRestartsCounter.inc()
app.listen(443, () => console.log('Server running at http://localhost:443'))