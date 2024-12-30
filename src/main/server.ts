import app from './config/app'
import { appRestartsCounter } from './config/registry-metrics'

appRestartsCounter.inc()
app.listen(3000, () => console.log('Server running at http://localhost:3000'))