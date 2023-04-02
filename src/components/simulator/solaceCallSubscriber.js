import { useRef, useEffect } from "react";
import CONFIG_CONSTANT from "../../services/configConstant";
import { solaceClient, STATUS as solaceStatus } from "../../services/solaceClient";
import * as pubsubEvents from "../../pubsub/events";
import { subscribeEvent } from "../../pubsub";


export default function SolaceCallSubscriber() {
  console.info('##### Refreshing Solace Call Subscriber #######');
  const debugMessageElementRef = useRef();

  useEffect(() => {
    const solaceConnHandler = subscribeEvent(pubsubEvents.SolaceConnectionEvent, (status, msg) => {
      if (status === solaceStatus.UP_SUCCESS) {
        solaceClient.subscribe(CONFIG_CONSTANT.SOLACE.TOPICS.CALL);
      }
    });
    const solaceSubscriptionHandler = subscribeEvent(pubsubEvents.SolaceSubscriptionEvent, (topicName, status, msg) => {
      let text = debugMessageElementRef.current.value;
      text = `${text}Topic: ${topicName}`;
      text = `${text}\nStatus: ${status}`;
      text = `${text}\nMessage: ${msg}`;
      text = `${text}\n\n`;
      debugMessageElementRef.current.value = text;
      debugMessageElementRef.current.scrollTop = debugMessageElementRef.current.scrollHeight;
    });
    const solaceSubscriptionReceivedHandler = subscribeEvent(pubsubEvents.SolaceSubscriptionReceivedEvent, (msg) => {
      let text = debugMessageElementRef.current.value;
      text = `${text}Message: ${msg.getBinaryAttachment()}`;
      text = `${text}\nDetails: ${msg.dump()}`;
      text = `${text}\n\n`;
      debugMessageElementRef.current.value = text;
      debugMessageElementRef.current.scrollTop = debugMessageElementRef.current.scrollHeight;
      console.log(msg);
    });

    solaceClient.connect();
    return () => {
      solaceConnHandler.unsubscribe();
      solaceSubscriptionHandler.unsubscribe();
      solaceSubscriptionReceivedHandler.unsubscribe();
    }
  });


  return (
    <div>
      <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Call Message Subscribe</label>
      <textarea ref={debugMessageElementRef} style={{height: '500px'}} id="message" rows="4" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Write your thoughts here..."></textarea>
    </div>
  );
}
