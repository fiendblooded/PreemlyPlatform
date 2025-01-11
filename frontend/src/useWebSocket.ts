import { useEffect, useState } from "react";

const useWebSocket = (url: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [message, setMessage] = useState<any | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessage(data);
    };

    return () => {
      socket.close();
    };
  }, [url]);

  return message;
};

export default useWebSocket;
