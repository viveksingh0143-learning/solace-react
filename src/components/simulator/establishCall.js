import { useRef, useCallback, useEffect, useState } from "react";
import SelectBox from "../ui/form/selectBox";
import { PhoneIcon, PhoneXMarkIcon } from '@heroicons/react/24/solid'
import CONFIG_CONSTANT from "../../services/configConstant";
import { solaceClient, STATUS as solaceStatus } from "../../services/solaceClient";
import * as pubsubEvents from "../../pubsub/events";
import { subscribeEvent } from "../../pubsub";
import Spinner from "../ui/spinner";

const environments = [
  { text: "Staging", value: "Staging" },
  { text: "Testing", value: "Testing" },
];
export default function EstablishCall() {
  console.info('##### Refreshing #######');
  const [isCallConnectInprogress, setIsCallConnectInprogress] = useState(false);
  const [isCallDisconnectInprogress, setIsCallDisconnectInprogress] = useState(false);
  const [callStatus, setCallStatus] = useState('Not Started');
  const staffIdInputElement = useRef();
  const environmentRef = useRef(environments[0].value);
  const pnrInputElement = useRef();
  const profileInputElement = useRef();
  const callerNumberInputElement = useRef();

  const setEnvironment = useCallback(() => (env) => {
    environmentRef.current = env;
  }, []);

  useEffect(() => {
    const solaceConnHandler = subscribeEvent(pubsubEvents.SolaceConnectionEvent, (status, msg) => {
      setCallStatus(status);
    });

    const solacePublishHandler = subscribeEvent(pubsubEvents.SolacePublishEvent, (topicName, status, msg) => {
      if (topicName === CONFIG_CONSTANT.SOLACE.TOPICS.CALL_ESTABLISHED) {
        if (status === solaceStatus.PUBLISH_SUCCESS) {
          setCallStatus('Call Established');
          setIsCallConnectInprogress(false);
        } else if (status === solaceStatus.PUBLISH_AWAIT) {
          setCallStatus('Call Established Inprogress');
          setIsCallConnectInprogress(true);
        } else if (status === solaceStatus.PUBLISH_FAIL) {
          setCallStatus('Call Established Failed');
          setIsCallConnectInprogress(false);
        }
      } else if (topicName === CONFIG_CONSTANT.SOLACE.TOPICS.CALL_DISCONNECT) {
        if (status === solaceStatus.PUBLISH_SUCCESS) {
          setCallStatus('Call Disconnected');
          setIsCallDisconnectInprogress(false);
        } else if (status === solaceStatus.PUBLISH_AWAIT) {
          setIsCallDisconnectInprogress(true);
          setCallStatus('Call Disconnection Inprogress');
        } else if (status === solaceStatus.PUBLISH_FAIL) {
          setCallStatus('Call Disconnection Failed');
          setIsCallDisconnectInprogress(false);
        }
      }
    });
    solaceClient.connect();
    return () => {
      solaceConnHandler.unsubscribe();
      solacePublishHandler.unsubscribe();
    }
  }, []);

  const onCallEstablished = useCallback(
    () => (event) => {
      event.preventDefault();
      const data = {
        staffId: staffIdInputElement.current?.value,
        environment: environmentRef.current,
        pnr: pnrInputElement.current?.value,
        profile: profileInputElement.current?.value,
        callerNumber: callerNumberInputElement.current?.value,
      };
      solaceClient.publishTopic(CONFIG_CONSTANT.SOLACE.TOPICS.CALL_ESTABLISHED, JSON.stringify(data));
    },
    []
  );

  const onCallDisconnect = useCallback(
    () => (event) => {
      event.preventDefault();
      const data = {
        staffId: staffIdInputElement.current?.value,
        environment: environmentRef.current,
        pnr: pnrInputElement.current?.value,
        profile: profileInputElement.current?.value,
        callerNumber: callerNumberInputElement.current?.value,
      };
      solaceClient.publishTopic(CONFIG_CONSTANT.SOLACE.TOPICS.CALL_DISCONNECT, JSON.stringify(data));
    },
    []
  );

  return (
    <form onSubmit={onCallEstablished()}>
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-10">
          <div className="sm:col-span-5 md:col-span-2">
            <div className="relative z-0">
              <input
                ref={staffIdInputElement}
                type="text"
                id="staffId"
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
              />
              <label
                htmlFor="staffId"
                className="absolute text-sm text-gray-700 dark:text-gray-600 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Staff ID
              </label>
            </div>
          </div>

          <div className="sm:col-span-5 md:col-span-2">
            <SelectBox
              options={environments}
              value={environmentRef.current}
              onChange={setEnvironment()}
            />
          </div>

          <div className="sm:col-span-5 md:col-span-2">
            <div className="relative z-0">
              <input
                ref={pnrInputElement}
                type="text"
                id="pnr"
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
              />
              <label
                htmlFor="pnr"
                className="absolute text-sm text-gray-700 dark:text-gray-600 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                PNR
              </label>
            </div>
          </div>

          <div className="sm:col-span-5 md:col-span-2">
            <div className="relative z-0">
              <input
                ref={profileInputElement}
                type="text"
                id="profile"
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
              />
              <label
                htmlFor="profile"
                className="absolute text-sm text-gray-700 dark:text-gray-600 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Profile
              </label>
            </div>
          </div>

          <div className="sm:col-span-5 md:col-span-2">
            <div className="relative z-0">
              <input
                ref={callerNumberInputElement}
                type="text"
                id="callerNumber"
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
              />
              <label
                htmlFor="callerNumber"
                className="absolute text-sm text-gray-700 dark:text-gray-600 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Caller Number
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between gap-x-6">
        <div>
          <span>Status:</span>
          <span className="pl-2 font-bold">{callStatus}</span>
        </div>
        <div>
          <button
            disabled={isCallConnectInprogress}
            type="submit"
            className="relative text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 disabled:opacity-50"
          >
            <PhoneIcon
              className="inline-block pr-2 h-5"
              aria-hidden="true"
            />
            <span className="inline-block">Call Establish</span>
            {isCallConnectInprogress ? <Spinner className="rounded-lg bg-blue-700/50" /> : null}
          </button>
          <button
            disabled={isCallDisconnectInprogress}
            onClick={onCallDisconnect()}
            type="button"
            className="relative text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 disabled:opacity-50"
          >
            <PhoneXMarkIcon
              className="inline-block pr-2 h-5"
              aria-hidden="true"
            />
            <span className="inline-block">Call Disconnect</span>
            {isCallDisconnectInprogress ? <Spinner className="rounded-lg bg-red-700/50" /> : null}
          </button>
        </div>
      </div>
    </form>
  );
}
