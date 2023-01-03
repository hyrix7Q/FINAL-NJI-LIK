import axios from "axios";

export const sendNotification = async (token, title, body) => {
  const headers = {
    "Content-Type": "application/json",
    host: "exp.host",
    accept: "application/json",
    "accept-encoding": "gzip, deflate",
  };
  axios.post(
    "https://exp.host/--/api/v2/push/send",
    {
      to: token,
      title: title,
      body: body,
    },
    {
      headers,
    }
  );
};
