// src/api.js
const backendUrl = import.meta.env.VITE_API_URL;

export const getData = async () => {
  const response = await fetch(`${backendUrl}/api/someEndpoint`);
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
};
