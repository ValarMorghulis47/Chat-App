import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useErrors = (errors = []) => {
  useEffect(() => {
    errors.forEach(({ isError, error, fallback }) => {
      if (isError) {
        if (fallback) fallback();
        else toast.error(error?.data?.message || "Something went wrong");
      }
    });
  }, [errors]);
};

const useAsyncMutation = (mutationFunc) => {   // we will pass the mutation function to this hook and it will handle the loading state for us and will send the data backe to us
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [mutate] = mutationFunc();  // we will take a name of the function just like we did in searchUser query

  const executeMutation = async (toastMessage, ...args) => {
    setIsLoading(true);
    const toastId = toast.loading(toastMessage || "Loading...");

    try {
      const res = await mutate(...args);

      if (res.data) {
        setData(res.data);
        toast.success(res.data.message, { id: toastId });     // what the id will do is that it will replace the loading toast with the success toast
      } else {
        toast.error(res?.error?.data?.message, { id: toastId });
      }
    } catch (error) {
      toast.error(error?.data?.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return [executeMutation, isLoading, data];
};

const useSocketEvents = (socket, eventHandlerObject) => {
  useEffect(() => {
    Object.entries(eventHandlerObject).forEach(([eventName, handler]) => {
      socket.on(eventName, handler);
    })

    return () => {
      Object.entries(eventHandlerObject).forEach(([eventName, handler]) => {
        socket.off(eventName, handler);
      })
    }
  }, [socket, eventHandlerObject]);
};

export { useErrors, useAsyncMutation, useSocketEvents };