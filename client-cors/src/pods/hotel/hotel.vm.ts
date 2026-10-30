export interface Hotel {
  id: string;
  name: string;
  description: string;
  rating: number;
  address: string;
  city: string;
  lowRate: number;
  highRate: number;
}

export const createEmptyHotel = (): Hotel => ({
  id: '',
  name: '',
  description: '',
  rating: 3,
  address: '',
  city: '',
  lowRate: 0,
  highRate: 0,
});
