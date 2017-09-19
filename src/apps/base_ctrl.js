class BaseCtrl {

    constructor(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
    }

    execute() {
        const obj = new Promise((resolve, reject) => {
            this.action(resolve, (err) => {
                reject(err);
            });
        });

        obj
        .then(data => this.res.json(data))
        .catch(err => this.next(err));

        return this;
    }

    static apiEntry() {
        const Cls = this;
        return (req, res, next) => new Cls(req, res, next).execute();
    }
}

module.exports = BaseCtrl;
