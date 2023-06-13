import { Client } from "podcast-api";
const listenApi = Client({ apiKey: process.env.REACT_APP_API_KEY });
export default listenApi
