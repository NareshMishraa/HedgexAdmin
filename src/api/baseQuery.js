import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import localStore from "../components/localStore.js";
import { STORAGES } from "../components/Store.jsx";

// Base query configuration for RTK Query
export const rtkBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL ,
  prepareHeaders: (headers, { getState }) => {
    const token = localStorage.getItem("token");
    console.log("🧩 Sending token:", token);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  responseHandler: async (response) => {
    try {
      if (!response.ok) {
        const contentType = response.headers.get("content-type");

        // Handle different HTTP errors
        if (response.status === 502) {
          throw new Error("Server is temporarily unavailable. Please try again later.");
        }
        // If it's not JSON (like in your error case), return a generic message
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("An unexpected error occurred. Please try again later.");
        }
      }
      return response.json();
    } catch (error) {
      return response.json();
    }
  },
});
