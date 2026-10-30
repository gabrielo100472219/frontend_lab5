import { type HotelEntityApi } from './hotel-collection.api-model';
import { request } from '#core/api';

export const getHotelCollection = (): Promise<HotelEntityApi[]> =>
  request<HotelEntityApi[]>('/hotels');

export const deleteHotel = async (id: string): Promise<boolean> => {
  await request<void>(`/hotels/${id}`, { method: 'DELETE' });
  return true;
};
