class BaseCtrl {

    constructor(parent) {
        this.parent = parent;
    }

    execute(res, next) {
        const obj = new Promise((resolve, reject) => {
            this.parent.task(resolve, (err) => {
                reject(err);
            });
        });

        obj
        .then(data => res.json(data))
        .catch(err => next(err));

        return this;
    }

    static create(parent, res, next) {
        return new BaseCtrl(parent).execute(res, next);
    }
}

module.exports = BaseCtrl;
