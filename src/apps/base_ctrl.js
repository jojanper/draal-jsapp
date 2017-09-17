class BaseCtrl {

    constructor(parent) {
        this.parent = parent;
    }

    execute(res, next) {
        const obj = new Promise((resolve, reject) => {
            this.parent.action(resolve, (err) => {
                reject(err);
            });
        });

        obj
        .then(data => res.json(data))
        .catch(err => next(err));

        return this;
    }

    static create(parent) {
        return new BaseCtrl(parent);
    }
}

module.exports = BaseCtrl;
