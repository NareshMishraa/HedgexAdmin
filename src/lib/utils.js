import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ethers } from "ethers";
import toast from "react-hot-toast";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const convertToEth = (wei, decimalPlaces) => {
  if (!wei) return wei;

  const ethValue = ethers.formatEther(wei.toString());

  return decimalPlaces !== undefined
    ? Number(ethValue).toFixed(decimalPlaces)
    : ethValue;
};

export const showErrorToast = (error) => {
  let message = error;

  if (!message || typeof message !== "string") {
    toast.error("Something went wrong. Please try again.");
    return;
  }

  const lowerCaseError = message.toLowerCase();

  if (lowerCaseError.includes("forbidden") || lowerCaseError.includes("403")) {
    message = "Access denied. You do not have permission to view this content.";
  } else {
    message = error; // Fallback to the error string if it's user-friendly
  }

  toast.error(message);
};

export const isValidJsonString = (value) => {
  try {
    if (typeof value !== "string") {
      return false;
    }
    const v = JSON.parse(value);
    return !!v || v === 0 || v === false || value === "";
  } catch (e) {
    return false;
  }
};

export const getTokenBalance = (
  token,
  accountBalance,
  tokenBalance,
  isConnected
) => {
  if (token?.symbol === "ETH" && isConnected) {
    return Number(accountBalance?.value) / 10 ** accountBalance?.decimals;
  }
  return tokenBalance ? Number(tokenBalance) / 10 ** token?.decimals : 0;
};

export const encryptPayload = async (password) => {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.NEXT_PUBLIC_ENCRYPTION_PASSWORD),
    { name: "PBKDF2" },
    false,
    ["deriveBITORIOs", "deriveKey"]
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode(process.env.NEXT_PUBLIC_ENCRYPTION_SALT),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-CBC", length: 256 },
    true,
    ["encrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(16));
  const encryptedData = await window.crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    key,
    encoder.encode(password)
  );

  return `${btoa(String.fromCharCode(...iv))}:${btoa(
    String.fromCharCode(...new Uint8Array(encryptedData))
  )}`;
};
