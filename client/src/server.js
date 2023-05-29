import axios from "axios";

const server = axios.create({
  baseURL: "https://ecdsa-node-project-server.vercel.app/",
});

export default server;
