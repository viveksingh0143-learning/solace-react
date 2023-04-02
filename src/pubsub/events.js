export class SolaceConnectionEvent {
    constructor(status, msg) {
        this.args = [status, msg];
    }
}
export class SolacePublishEvent {
    constructor(topicName, status, msg) {
        this.args = [topicName, status, msg];
    }
}
export class SolaceSubscriptionEvent {
    constructor(topicName, status, msg) {
        this.args = [topicName, status, msg];
    }
}
export class SolaceSubscriptionReceivedEvent {
    constructor(msg) {
        this.args = [msg];
    }
}
