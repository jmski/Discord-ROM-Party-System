module.exports = class Party2 {
    constructor(type, time, userRole, userId, description) {
        this.type = type;
        this.time = time;
        this.description = description;
        
        this.RIPE1 = 'OPEN';
        this.RIPE2 = 'OPEN';

        this.owner = userId;

        this[userRole] = userId;

        this.timer = -1;
    }
}   