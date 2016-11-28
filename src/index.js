const Cluster = require('cluster');
const Master = require('./master');
const Worker = require('./worker');

if (Cluster.isMaster) {
    // Fork Workers
    for (let i = 0; i < 8; i++) {
        Cluster.fork();
    }

    // Setup master
    let master = new Master(Cluster.workers);

} else {
    // Setup worker
    let worker = new Worker();
}
