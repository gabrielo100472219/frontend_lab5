import axios, { isAxiosError } from "axios";
import type { Hotel, NewHotel } from "./hotels.api.ts";

// axios sends "Accept: application/json, text/plain, */*" by default, and the
// server compares the header with !== "application/json": 406. Fixed once here.
// Content-Type: application/json is added by axios when the body is an object.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  headers: { Accept: "application/json" },
});

export const getHotels = async () => {
  const { data } = await api.get<{ data: Hotel[] }>("/hotels");
  return data.data;
};

// axios rejects on any non-2xx, so the 404 (D1) arrives in the catch.
export const getHotel = async (id: string): Promise<Hotel | null> => {
  try {
    const { data } = await api.get<{ data: Hotel }>(`/hotels/${id}`);
    return data.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createHotel = async (hotel: NewHotel) => {
  const { data } = await api.post<{ data: Hotel }>("/hotels", hotel);
  return data.data;
};

export const updateHotel = async (id: string, changes: Partial<NewHotel>) => {
  const { data } = await api.put<{ data: Hotel }>(`/hotels/${id}`, changes);
  return data.data;
};

export const deleteHotel = async (id: string) => {
  await api.delete(`/hotels/${id}`);
};
