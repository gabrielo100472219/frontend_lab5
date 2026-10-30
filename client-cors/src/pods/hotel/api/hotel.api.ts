import { type Hotel } from './hotel.api-model';
import { type Lookup } from '#common/models';
import { request } from '#core/api';

export const getHotel = (id: string): Promise<Hotel> =>
  request<Hotel>(`/hotels/${id}`);

export const getCities = (): Promise<Lookup[]> => request<Lookup[]>('/cities');

// No id yet → POST (the server generates it); otherwise PUT on that id.
export const saveHotel = async (hotel: Hotel): Promise<boolean> => {
  const { id, ...fields } = hotel;
  if (id) {
    await request<Hotel>(`/hotels/${id}`, { method: 'PUT', body: fields });
  } else {
    await request<Hotel>('/hotels', { method: 'POST', body: fields });
  }
  return true;
};
