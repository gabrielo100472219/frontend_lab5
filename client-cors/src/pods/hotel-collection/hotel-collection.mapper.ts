import * as apiModel from './api/hotel-collection.api-model';
import * as viewModel from './hotel-collection.vm';
import { toServerUrl } from '#core/api';

export const mapFromApiToVm = (
  hotel: apiModel.HotelEntityApi
): viewModel.HotelEntityVm => ({
  id: hotel.id,
  picture: toServerUrl(hotel.thumbNailUrl),
  name: hotel.name,
  description: hotel.shortDescription,
  rating: hotel.hotelRating,
  address: hotel.address1,
});
