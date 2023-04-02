import { useCallback, useRef } from "react";

export default function IVRPayment() {
  console.info('##### Refreshing #######');
  const staffIdInputElement = useRef();
  const staffPosInputElement = useRef();

  const onIVRPayment = useCallback(
    () => (event) => {
      event.preventDefault();
      const data = {
        staffId: staffIdInputElement.current?.value,
        staffPos: staffPosInputElement.current?.value,
      };
      console.log(data);
    },
    []
  );

  return (
    <form onSubmit={onIVRPayment()}>
      <div className="space-y-12">
        <div className="mt-6 flex flex-align-start gap-x-6">
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
          <div className="relative z-0">
            <input
              ref={staffPosInputElement}
              type="text"
              id="staffPos"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="staffPos"
              className="absolute text-sm text-gray-700 dark:text-gray-600 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Staff POS
            </label>
          </div>
          <button
            type="submit"
            className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 "
          >
            IVR Payment
          </button>
        </div>
      </div>
    </form>
  );
}
