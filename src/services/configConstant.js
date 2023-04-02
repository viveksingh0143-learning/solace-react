const CONFIG_CONSTANT = {
    SOLACE: {
        DEBUG: process.env.SOLACE_DEBUG === 'true',
        CONNECTION_PROPERTIES: {
            URL: process.env.SOLACE_CONN_URL,
            VPN_NAME: process.env.SOLACE_CONN_VPN_NAME,
            USERNAME: process.env.SOLACE_CONN_USERNAME,
            PASSWORD: process.env.SOLACE_CONN_PASSWORD
        },
        TOPICS: {
            CALL_ESTABLISHED: process.env.SOLACE_TOPIC_CALL_ESTABLISHED,
            CALL_DISCONNECT: process.env.SOLACE_TOPIC_CALL_DISCONNECT,
            CALL: process.env.SOLACE_TOPIC_CALL,
            IVR_PAYMENT_INITIATE: process.env.SOLACE_TOPIC_IVR_PAYMENT_INITIATE,
        }
    }
};

export default CONFIG_CONSTANT;