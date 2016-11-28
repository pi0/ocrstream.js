const Tesseract = require('tesseract.js');


class Worker {

    constructor() {
        // Function Binds
        this.handleEvent = this.handleEvent.bind(this);
        this.recognize = this.recognize.bind(this);
        this.notify = this.notify.bind(this);

        process.on('message', this.handleEvent);
    }

    handleEvent(event) {
        if (event.job) {
            this.recognize(event.job);
        }
    }

    notify(job) {
        process.send({notify: job});
    }

    recognize(job) {
        // Create tjob
        let tjob = Tesseract.recognize(job.image);

        // Handle tjob events
        tjob.then((data)=> {
            job.text = data.text;
            job.done = true;
            this.notify(job);
        });

        tjob.progress((message)=> {
            if (message.progress) {
                job.progress = message.progress;
            }
            this.notify(job);
        });

        tjob.catch((err)=> {
            job.error = err + '';
            job.done = true;
            this.notify(job);
        });
    }

}

module.exports = Worker;
