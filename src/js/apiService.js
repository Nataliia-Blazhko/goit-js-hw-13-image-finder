const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '21282104-2eb447408a79d7cba0630cd2c';

export default {
  async searchImage(query, page) {
    const response = await fetch(
      `${BASE_URL}?image_type=photo&orientation=horizontal&q=${query}&page=${page}&per_page=12&key=${API_KEY}`,
    );

    if (!response.ok) {
      throw response;
    }

    const result = await response.json();

    return result;
  },
};
