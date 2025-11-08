const config = require('./config').metrics;
const os = require('os');

// Metrics stored in memory
const requests = {};
const activeUsers = {};
let totalRequests = 0;

//Auth varaibles
let totalActiveUsers = 0;
let totalSuccessLogin = 0;
let totalFailedLogin = 0;
const INTERVAL =3000 //5 s
const RESET_INTERVAL = 5;  //Reset at (interval * resetInterval) -> (e.g)5*6 =30 seconds
//pizza vairables
let pizzaPurchaseLatency = 0;
let requestsLatency = 0;
let pizzaPurchasePrice = 0.5;
let pizzaPurchaseSuccess = 0;
let pizzaPurchaseError = 0;

function getCpuUsagePercentage() {
    const cpuUsage = os.loadavg()[0] / os.cpus().length;
    return cpuUsage.toFixed(2) * 100;
}

function getMemoryUsagePercentage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;
    return memoryUsage.toFixed(2);
}

// Function to track Pizza Purchases
function pizzaPurchase(status, latency, price, totalPizzas) {
    pizzaPurchaseLatency = latency;
    pizzaPurchasePrice += price;

    if (status == "success") {
        pizzaPurchaseSuccess += totalPizzas;
    } else {
        pizzaPurchaseError += totalPizzas;
    }
}
//Function to track auth success and fails
function authRequest(status){
    if (status =="success"){
        totalSuccessLogin +=1;
    } else{
        totalFailedLogin+=1;
    }
}
// Function to track how many users are active.
function refreshActiveUser(req) {
    //Get token
    let token = req.headers.authorization;
    if (req.headers.authorization) {
        activeUsers[token] = 0; //Reset lifespan intervals of the user
    }
    // activeUsers.push(req.headers.authorization)
    if (req.method == 'DELETE' && req.path == '/api/auth') {
        delete activeUsers.token;
    }
}
function updateActiveUsers() {
    for (const user in activeUsers) {
        activeUsers[user] += 1; //Adds an interval of lifespan to the user
        if (activeUsers[user] > RESET_INTERVAL) { //If user interval is greater than the reset interval, delete from the list.
            delete activeUsers[user];
        }
    }
    return Object.keys(activeUsers).length
}

// Middleware to track requests
function requestTracker(req, res, next) {
    const endpoint = `[${req.method}] ${req.path}`;
    //Increment total requests at endpoint
    requests[endpoint] = (requests[endpoint] || 0) + 1;
    //Increment total requests (general)
    totalRequests += 1;
    //Calculate total Active Users
    refreshActiveUser(req);

    //Calculate latency
    let startTime = performance.now()
    next();
    res.on("finish", () => { requestsLatency = performance.now() - startTime })
}

// This will periodically send metrics to Grafana
setInterval(() => {
    const metrics = [];
    totalActiveUsers = updateActiveUsers();

    Object.keys(requests).forEach((endpoint) => {
        metrics.push(createMetric('requests', requests[endpoint], '1', 'sum', 'asInt', { endpoint }));
        metrics.push(createMetric('totalRequests', totalRequests, '1', 'sum', 'asInt', {}));
        metrics.push(createMetric('pizzaPurchasePrice', pizzaPurchasePrice, '1', 'sum', 'asDouble', {}));
        metrics.push(createMetric("pizzaPurchaseLatency", pizzaPurchaseLatency, "1", "sum", 'asDouble', {}))
        metrics.push(createMetric('pizzaPurchaseSuccess', pizzaPurchaseSuccess, '1', 'sum', 'asInt', {}));
        metrics.push(createMetric("pizzaPurchaseError", pizzaPurchaseError, "1", "sum", 'asInt', {}))
        metrics.push(createMetric("requestsLatency", requestsLatency, "1", "sum", 'asDouble', {}))
        metrics.push(createMetric("authSuccess", totalSuccessLogin, "1", "sum", 'asInt', {}))
        metrics.push(createMetric("authFailure", totalFailedLogin, "1", "sum", 'asInt', {}))

    });

    //Active Users
    metrics.push(createMetric('totalActiveUsers', totalActiveUsers, '1', 'sum', 'asInt', {}));
    //Memory and CPU
    metrics.push(createMetric('memoryUsage', getMemoryUsagePercentage(), '%', 'gauge', 'asDouble', {}));
    metrics.push(createMetric('cpuUsage', getCpuUsagePercentage(), '%', 'gauge', 'asDouble', {}));


    sendMetricToGrafana(metrics);
    totalRequests = 0;
}, INTERVAL);

function createMetric(metricName, metricValue, metricUnit, metricType, valueType, attributes) {
    attributes = { ...attributes, source: config.source };

    const metric = {
        name: metricName,
        unit: metricUnit,
        [metricType]: {
            dataPoints: [
                {
                    [valueType]: metricValue,
                    timeUnixNano: Date.now() * 1000000,
                    attributes: [],
                },
            ],
        },
    };

    Object.keys(attributes).forEach((key) => {
        metric[metricType].dataPoints[0].attributes.push({
            key: key,
            value: { stringValue: attributes[key] },
        });
    });

    if (metricType === 'sum') {
        metric[metricType].aggregationTemporality = 'AGGREGATION_TEMPORALITY_CUMULATIVE';
        metric[metricType].isMonotonic = true;
    } else if (metricType === 'gauge') {
        metric[metricType].aggregationTemporality = 'AGGREGATION_TEMPORALITY_UNSPECIFIED';
    } else if (metricType === 'histogram') {
        metric[metricType].aggregationTemporality = 'AGGREGATION_TEMPORALITY_DELTA';

    };


    return metric;
}

function sendMetricToGrafana(metrics) {
    const body = {
        resourceMetrics: [
            {
                scopeMetrics: [
                    {
                        metrics,
                    },
                ],
            },
        ],
    };

    fetch(`${config.url}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP status: ${response.status}`);
            }
        })
        .catch((error) => {
            console.error('Error pushing metrics:', error);
        });
}

module.exports = { requestTracker, pizzaPurchase, authRequest };