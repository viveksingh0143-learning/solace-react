import solace from "solclientjs";
import CONFIG_CONSTANT from "./config-constant";


const factoryProps = new solace.SolclientFactoryProperties();
factoryProps.profile = solace.SolclientFactoryProfiles.version10;
solace.SolclientFactory.init(factoryProps);

export class SolaceTopicPublisher {
    session = null;
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
            this.log('Already connected and ready to publish messages.');
            return;
        }
        // check for valid protocols
        if (this.connConfig.url.lastIndexOf('ws://', 0) !== 0 && this.connConfig.url.lastIndexOf('wss://', 0) !== 0 &&
            this.connConfig.url.lastIndexOf('http://', 0) !== 0 && this.connConfig.url.lastIndexOf('https://', 0) !== 0) {
            this.log('Invalid protocol - please use one of ws://, wss://, http://, https://');
            return;
        }
        if (!this.connConfig.url || !this.connConfig.userName || !this.connConfig.password || !this.connConfig.vpnName) {
            this.log('Cannot connect: please specify all the Solace PubSub+ Event Broker properties.');
            return;
        }
        this.log('Connecting to Solace PubSub+ Event Broker using url: ' + this.connConfig.url);
        this.log('Client username: ' + this.connConfig.userName);
        this.log('Solace PubSub+ Event Broker VPN name: ' + this.connConfig.vpnName);
        // create session
        try {
            this.session = solace.SolclientFactory.createSession(this.connConfig);
        } catch (error) {
            this.log(error.toString());
        }
        // define session event listeners
        this.session.on(solace.SessionEventCode.UP_NOTICE, (sessionEvent) => {
            this.log('=== Successfully connected and ready to publish messages. ===');
        });
        this.session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (sessionEvent) => {
            this.log('Connection failed to the message router: ' + sessionEvent.infoStr +
                ' - check correct parameter values and connectivity!');
        });
        this.session.on(solace.SessionEventCode.DISCONNECTED, (sessionEvent) => {
            this.log('Disconnected.');
            if (this.session !== null) {
                this.session.dispose();
                this.session = null;
            }
        });

        this.connectToSolace();
    };

    connectToSolace = () => {
        try {
            this.session.connect();
        } catch (error) {
            this.log(error.toString());
        }
    };

    disconnect = () => {
        this.log('Disconnecting from Solace PubSub+ Event Broker...');
        if (this.session !== null) {
            try {
                this.session.disconnect();
            } catch (error) {
                this.log(error.toString());
            }
        } else {
            this.log('Not connected to Solace PubSub+ Event Broker.');
        }
    };

    publishTopic = (topicName, topicBody) => {
        return new Promise((resolve, reject) => {
            if (this.session !== null) {
                var message = solace.SolclientFactory.createMessage();
                message.setDestination(solace.SolclientFactory.createTopicDestination(topicName));
                message.setBinaryAttachment(topicBody);
                message.setDeliveryMode(solace.MessageDeliveryModeType.DIRECT);
                this.log('Publishing below message  to topic "' + topicName + '"...');
                this.log(JSON.stringify(topicBody));
                try {
                    this.session.send(message);
                    resolve(this.log('Message published.'));
                } catch (error) {
                    reject(this.log(error.toString()));
                }
            } else {
                reject(this.log('Cannot publish because not connected to Solace PubSub+ Event Broker.'));
            }
        });
    };

    log = function (line) {
        if (CONFIG_CONSTANT.SOLACE.DEBUG) {
            var now = new Date();
            var time = [('0' + now.getHours()).slice(-2), ('0' + now.getMinutes()).slice(-2), ('0' + now.getSeconds()).slice(-2)];
            var timestamp = '[' + time.join(':') + '] ';
            console.log(timestamp + line);
        }
        return line;
    };
}
