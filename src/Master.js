const Pace = require('pace');

class Master {

    constructor(workers) {
        // Function Binds
        this.onNotify = this.onNotify.bind(this);
        this.handleEvent = this.handleEvent.bind(this);
        this.load_jobs = this.load_jobs.bind(this);
        this.add_job = this.add_job.bind(this);
        this.register_worker = this.register_worker.bind(this);

        // Class fields
        this.queue = [];
        this.workers = [];

        // Fancy Progress
        this.progress = Pace(Infinity);

        // Workers
        Object.keys(workers).forEach(id=>this.register_worker(id, workers[id]));

        // Jobs
        this.load_jobs();

    }

    load_jobs() {
        for (let i = 0; i < 32; i++) {
            this.add_job({id: i, image: 's.png'});
        }
        this.update();
    }

    add_job({id, image}) {
        this.queue.push({
            id,
            image,
            text: '',
            done: false,
            progress: 0,
        });
    }

    register_worker(id, worker) {
        worker._id = id;
        this.workers.push(worker);
        worker.on('message', (event)=>this.handleEvent(event, worker));
    }

    assignJob() {
        // Find first job without worker
        let job = this.queue.pop();
        if (!job)return;

        // Find a non busy worker
        for (let i = 0; i < this.workers.length; i++) {
            if (this.workers[i]._job && this.workers[i]._job.done !== true) continue;
            // We found it
            this.workers[i]._job = job;
            this.workers[i].send({job});
            return true;
        }

        // We didn't found any worker, add it back!
        this.queue.push(job);

    }

    handleEvent(event, worker) {
        if (event.notify) {
            this.onNotify(event.notify, worker);
        }
    }

    update() {
        // Try to assign job
        this.assignJob();

        // Update progress
        let p = 0;
        let t = this.queue.length * 100;
        this.workers.forEach(worker=> {
            if (worker._job) {
                t += 100;
                p += worker._job.progress * 100;
            }
        });
        this.progress.total = t;
        this.progress.op(p);
    }

    onNotify(job, worker) {
        // Update worker job
        worker._job = job;

        //
        this.update();

        //
        if (job.done) {
            delete worker._job;
            console.log(job.text.match(/TLG.*/));
        }
    }


}

module.exports = Master;