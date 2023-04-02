import solace from "solclientjs";
import CONFIG_CONSTANT from "./configConstant";
import * as pubsubEvents from "../pubsub/events";
import { publishEvent } from "../pubsub";

const factoryProps = new solace.SolclientFactoryProperties();
factoryProps.profile = solace.SolclientFactoryProfiles.version10;
solace.SolclientFactory.init(factoryProps);

export const STATUS = {
    UP_AWAIT: "Connecting Await",
    UP_SUCCESS: "Ready",
    UP_FAIL: "Connection Failed",
    DOWN_AWAIT: "Disconnection Await",
    DOWN_SUCCESS: "Connection Down",
    DOWN_FAIL: "Disconnection Failed",
    SUBSCRIPTION_AWAIT: "Subscription Await",
    SUBSCRIPTION_SUCCESS: "Subscribed",
    SUBSCRIPTION_FAIL: "Subscription Failed",
    UNSUBSCRIPTION_AWAIT: "Unsubscription Await",
    UNSUBSCRIPTION_SUCCESS: "Unsubscribed",
    UNSUBSCRIPTION_FAIL: "Unsubscription Failed",
    PUBLISH_AWAIT: "Publish Await",
    PUBLISH_SUCCESS: "Publish Success",
    PUBLISH_FAIL: "Publish Failed"
};

class SolaceClient {
    session = null;
    topicsSubscribed = [];
    connConfig = {
        url: CONFIG_CONSTANT.SOLACE.CONNECTION_PROPERTIES.URL,
        vpnName: CONFIG_CONSTANT.SOLACE.CONNECTION_PROPERTIES.VPN_NAME,
        userName: CONFIG_CONSTANT.SOLACE.CONNECTION_PROPERTIES.USERNAME,
        password: CONFIG_CONSTANT.SOLACE.CONNECTION_PROPERTIES.PASSWORD,
    };

    constructor(url, vpnName, userName, password) {
        if (arguments.length > 0) {
            this.connConfig = { url, vpnName, userName, password };
        }
    }

    connect = () => {
        if (this.session !== null) {
            const msg = 'Already connected and ready to publish messages.';
            this.log(msg);
            publishEvent(new pubsubEvents.SolaceConnectionEvent(STATUS.UP_SUCCESS, msg));
            return;
        }
        // check for valid protocols
        if (this.connConfig.url.lastIndexOf('ws://', 0) !== 0 && this.connConfig.url.lastIndexOf('wss://', 0) !== 0 &&
            this.connConfig.url.lastIndexOf('http://', 0) !== 0 && this.connConfig.url.lastIndexOf('https://', 0) !== 0) {
            const msg = 'Invalid protocol - please use one of ws://, wss://, http://, https://';
            this.log(msg);
            publishEvent(new pubsubEvents.SolaceConnectionEvent(STATUS.UP_FAIL, msg));
            return;
        }
        if (!this.connConfig.url || !this.connConfig.userName || !this.connConfig.password || !this.connConfig.vpnName) {
            const msg = 'Cannot connect: please specify all the Solace PubSub+ Event Broker properties.';
            this.log(msg);
            publishEvent(new pubsubEvents.SolaceConnectionEvent(STATUS.UP_FAIL, msg));
            return;
        }
        publishEvent(new pubsubEvents.SolaceConnectionEvent(STATUS.UP_AWAIT, `Connecting to Solace PubSub+ Event Broker using url: ${this.connConfig.url}`));
        this.log(`Connecting to Solace PubSub+ Event Broker using url: ${this.connConfig.url}`);
        this.log(`Client username: ${this.connConfig.userName}`);
        this.log(`Solace PubSub+ Event Broker VPN name: ${this.connConfig.vpnName}`);
        // create session
        try {
            this.session = solace.SolclientFactory.createSession(this.connConfig);
        } catch (error) {
            const msg = error.toString();
            this.log(msg);
            publishEvent(new pubsubEvents.SolaceConnectionEvent(STATUS.UP_FAIL, msg));
            return;
        }
        // define session event listeners
        this.session.on(solace.SessionEventCode.UP_NOTICE, (sessionEvent) => {
            const msg = '=== Successfully connected and ready to publish/subscribe messages. ===';
            this.log(msg);
            publishEvent(new pubsubEvents.SolaceConnectionEvent(STATUS.UP_SUCCESS, msg));
        });
        this.session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (sessionEvent) => {
            const msg = `Connection failed to the message router: ${sessionEvent.infoStr} - check correct parameter values and connectivity!`;
            this.log(msg);
            publishEvent(new pubsubEvents.SolaceConnectionEvent(STATUS.UP_FAIL, msg));
        });
        this.session.on(solace.SessionEventCode.DISCONNECTED, (sessionEvent) => {
            const msg = 'Disconnected.';
            this.log(msg);
            publishEvent(new pubsubEvents.SolaceConnectionEvent(STATUS.DOWN_SUCCESS, msg));
            if (this.session !== null) {
                this.session.dispose();
                this.session = null;
            }
        });
        this.session.on(solace.SessionEventCode.SUBSCRIPTION_ERROR, (sessionEvent) => {
            const msg = `Cannot subscribe to topic: ${sessionEvent.correlationKey}`;
            this.log(msg);
            publishEvent(new pubsubEvents.SolaceSubscriptionEvent(sessionEvent.correlationKey, STATUS.SUBSCRIPTION_FAIL, msg));
        });
        this.session.on(solace.SessionEventCode.SUBSCRIPTION_OK, (sessionEvent) => {
            const topicName = sessionEvent.correlationKey;
            if (this.topicsSubscribed.includes(topicName)) {
                const index = this.topicsSubscribed.indexOf(topicName);
                this.topicsSubscribed.splice(index, 1);
                const msg = `Successfully unsubscribed from topic: ${topicName}`;
                this.log(msg);
                publishEvent(new pubsubEvents.SolaceSubscriptionEvent(topicName, STATUS.UNSUBSCRIPTION_SUCCESS, msg));
            } else {
                this.topicsSubscribed.push(topicName);
                const msg = `Successfully subscribed to topic: ${topicName}\n=== Ready to receive messages. ===`;
                this.log(msg);
                publishEvent(new pubsubEvents.SolaceSubscriptionEvent(topicName, STATUS.SUBSCRIPTION_SUCCESS, msg));
            }
        });
        // define message event listener
        this.session.on(solace.SessionEventCode.MESSAGE, (message) => {
            this.log(`Received message: ${message.getBinaryAttachment()}, details:\n${message.dump()}`);
            publishEvent(new pubsubEvents.SolaceSubscriptionReceivedEvent(message));
        });
        try {
            this.session.connect();
        } catch (error) {
            const msg = error.toString();
            this.log(msg);
            publishEvent(new pubsubEvents.SolaceConnectionEvent(STATUS.UP_FAIL, msg));
        }
    };

    disconnect = () => {
        const msg = 'Disconnecting from Solace PubSub+ Event Broker...';
        this.log(msg);
        publishEvent(new pubsubEvents.SolaceConnectionEvent(STATUS.DOWN_AWAIT, msg));
        if (this.session !== null) {
            try {
                this.session.disconnect();
            } catch (error) {
                const msg = error.toString();
                this.log(msg);
                publishEvent(new pubsubEvents.SolaceConnectionEvent(STATUS.DOWN_FAIL, msg));
            }
        } else {
            const msg = 'Not connected to Solace PubSub+ Event Broker.';
            this.log(msg);
            publishEvent(new pubsubEvents.SolaceConnectionEvent(STATUS.DOWN_SUCCESS, msg));
        }
    };

    publishTopic = (topicName, topicBody) => {
        if (this.session !== null) {
            const msg = `Publishing message to topic ${topicName}...`;
            publishEvent(new pubsubEvents.SolacePublishEvent(topicName, STATUS.PUBLISH_AWAIT, msg));

            var message = solace.SolclientFactory.createMessage();
            message.setDestination(solace.SolclientFactory.createTopicDestination(topicName));
            message.setBinaryAttachment(topicBody);
            message.setDeliveryMode(solace.MessageDeliveryModeType.DIRECT);
            this.log(`Publishing below message to topic ${topicName}...`);
            this.log(JSON.stringify(topicBody));
            try {
                this.session.send(message);
                const msg = `Message published to ${topicName}.`;
                publishEvent(new pubsubEvents.SolacePublishEvent(topicName, STATUS.PUBLISH_SUCCESS, msg));
            } catch (error) {
                const msg = error.toString();
                this.log(msg);
                publishEvent(new pubsubEvents.SolacePublishEvent(topicName, STATUS.PUBLISH_FAIL, msg));
            }
        } else {
            const msg = 'Cannot publish because not connected to Solace PubSub+ Event Broker.';
            this.log(msg);
            publishEvent(new pubsubEvents.SolacePublishEvent(topicName, STATUS.PUBLISH_FAIL, msg));
        }
    };

    subscribe = (topicName) => {
        if (this.session !== null) {
            if (this.topicsSubscribed.includes(topicName)) {
                const msg = `Already subscribed to ${topicName} and ready to receive messages.`;
                this.log(msg);
                publishEvent(new pubsubEvents.SolaceSubscriptionEvent(topicName, STATUS.SUBSCRIPTION_SUCCESS, msg));
            } else {
                const msg = `Subscribing to topic: ${topicName}`;
                this.log(msg);
                publishEvent(new pubsubEvents.SolaceSubscriptionEvent(topicName, STATUS.SUBSCRIPTION_AWAIT, msg));
                try {
                    this.session.subscribe(
                        solace.SolclientFactory.createTopicDestination(topicName),
                        true, // generate confirmation when subscription is added successfully
                        topicName, // use topic name as correlation key
                        10000 // 10 seconds timeout for this operation
                    );
                } catch (error) {
                    const msg = error.toString();
                    this.log(msg);
                    publishEvent(new pubsubEvents.SolaceSubscriptionEvent(topicName, STATUS.SUBSCRIPTION_FAIL, msg));
                }
            }
        } else {
            const msg = 'Cannot subscribe because not connected to Solace PubSub+ Event Broker.';
            this.log(msg);
            publishEvent(new pubsubEvents.SolaceSubscriptionEvent(topicName, STATUS.SUBSCRIPTION_FAIL, msg));
        }
    };

    // Unsubscribes from topic on Solace PubSub+ Event Broker
    unsubscribe = (topicName) => {
        if (this.session !== null) {
            if (this.topicsSubscribed.includes(topicName)) {
                const msg = `Unsubscribing from topic: ${topicName}`;
                this.log(msg);
                publishEvent(new pubsubEvents.SolaceSubscriptionEvent(topicName, STATUS.UNSUBSCRIPTION_AWAIT, msg));
                try {
                    this.session.unsubscribe(
                        solace.SolclientFactory.createTopicDestination(topicName),
                        true, // generate confirmation when subscription is removed successfully
                        topicName, // use topic name as correlation key
                        10000 // 10 seconds timeout for this operation
                    );
                } catch (error) {
                    const msg = error.toString();
                    this.log(msg);
                    publishEvent(new pubsubEvents.SolaceSubscriptionEvent(topicName, STATUS.UNSUBSCRIPTION_FAIL, msg));
                }
            } else {
                const msg = `Cannot unsubscribe because not subscribed to the topic ${topicName}`;
                this.log(msg);
                publishEvent(new pubsubEvents.SolaceSubscriptionEvent(topicName, STATUS.UNSUBSCRIPTION_FAIL, msg));
            }
        } else {
            const msg = 'Cannot unsubscribe because not connected to Solace PubSub+ Event Broker.';
            this.log(msg);
            publishEvent(new pubsubEvents.SolaceSubscriptionEvent(topicName, STATUS.UNSUBSCRIPTION_FAIL, msg));
        }
    };

    log = (line) => {
        if (CONFIG_CONSTANT.SOLACE.DEBUG) {
            var now = new Date();
            var time = [('0' + now.getHours()).slice(-2), ('0' + now.getMinutes()).slice(-2), ('0' + now.getSeconds()).slice(-2)];
            var timestamp = '[' + time.join(':') + '] ';
            console.log(timestamp + line);
        }
        return line;
    };
}

export const solaceClient = new SolaceClient();
