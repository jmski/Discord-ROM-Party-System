module.exports = class Party {
    constructor(type, time, userRole, userId, faction, description) {
        this.type = type;
        this.time = time;
        this.description = description;
        if(this.type.includes('VR')) {
            this.faction = faction;
        }
        else {
            this.faction = null;
        }

        this.RIPE1 = 'OPEN';
        this.RIPE2 = 'OPEN';
        this.RIPE3 = 'OPEN';
        this.RIPE4 = 'OPEN';
        this.RIPE5 = 'OPEN';
        this.RIPE6 = 'OPEN';

        this.owner = userId;

        this[userRole] = userId;

        this.timer = -1;
    }
}   