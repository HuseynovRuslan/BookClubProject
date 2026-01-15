import axiosClient from './axiosClient';

// ==================== ADMIN STATS ====================
export const getAdminStats = async () => {
  // This could aggregate counts from different endpoints
  const [booksRes, authorsRes, genresRes, usersRes, feedbacksRes, newsRes] = await Promise.allSettled([
    axiosClient.get('/admin/books', { params: { pageNumber: 1, pageSize: 1 } }),
    axiosClient.get('/authors/action/get-all-authors', { params: { pageNumber: 1, pageSize: 1 } }),
    axiosClient.get('/genres/get-all-genres', { params: { pageNumber: 1, pageSize: 1 } }),
    axiosClient.get('/users/get-all-users', { params: { pageNumber: 1, pageSize: 1 } }),
    axiosClient.get('/admin/feedbacks', { params: { pageNumber: 1, pageSize: 1 } }),
    axiosClient.get('/informations/Information/get-all-information'),
  ]);

  // News count - check if it's a PagedResult or array
  let newsCount = 0;
  if (newsRes.status === 'fulfilled') {
    const newsData = newsRes.value.data;
    if (newsData?.totalCount !== undefined) {
      newsCount = newsData.totalCount;
    } else if (Array.isArray(newsData?.items)) {
      newsCount = newsData.items.length;
    } else if (Array.isArray(newsData)) {
      newsCount = newsData.length;
    }
  }

  return {
    totalBooks: booksRes.status === 'fulfilled' ? booksRes.value.data?.totalCount || 0 : 0,
    totalAuthors: authorsRes.status === 'fulfilled' ? authorsRes.value.data?.totalCount || 0 : 0,
    totalGenres: genresRes.status === 'fulfilled' ? genresRes.value.data?.totalCount || 0 : 0,
    totalUsers: usersRes.status === 'fulfilled' ? usersRes.value.data?.totalCount || 0 : 0,
    totalFeedbacks: feedbacksRes.status === 'fulfilled' ? feedbacksRes.value.data?.totalCount || 0 : 0,
    totalNews: newsCount,
  };
};

// ==================== NEWS / INFORMATIONS ====================
export const getAllNews = async (pageNumber = 1, pageSize = 10) => {
  const response = await axiosClient.get('/informations/Information/get-all-information');
  return response.data;
};

export const getNewsById = async (id) => {
  const response = await axiosClient.get(`/informations/Information/get-information-by-id/${id}`);
  return response.data;
};

export const createNews = async (data) => {
  // data: { title, content, details, coverImageUrl }
  const response = await axiosClient.post('/informations/Information/create-information', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateNews = async (data) => {
  // data: { id, title, content, details, coverImageUrl }
  const response = await axiosClient.put('/informations/Information/update-information', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteNews = async (id) => {
  const response = await axiosClient.delete(`/informations/Information/delete-information/${id}`);
  return response.data;
};

// ==================== FEEDBACKS ====================
export const getAllFeedbacks = async (pageNumber = 1, pageSize = 10) => {
  const response = await axiosClient.get('/admin/feedbacks', {
    params: { pageNumber, pageSize },
  });
  return response.data;
};

export const getFeedbackById = async (id) => {
  const response = await axiosClient.get(`/admin/feedbacks/${id}`);
  return response.data;
};

export const deleteFeedback = async (id) => {
  const response = await axiosClient.delete(`/admin/feedbacks/${id}`);
  return response.data;
};

// ==================== BOOKS (Admin) ====================
export const getAllBooksAdmin = async (pageNumber = 1, pageSize = 10, searchTerm = '') => {
  const params = { pageNumber, pageSize };
  // Backend uses 'Query' parameter, not 'searchTerm'
  if (searchTerm) {
    params.query = searchTerm;
  }
  const response = await axiosClient.get('/admin/books', { params });
  return response.data;
};

export const createBook = async (formData) => {
  // formData should contain: Title, Description, ISBN, PublicationDate, Language, PageCount, Publisher, AuthorId, CoverImage (file)
  const response = await axiosClient.post('/books/create-book', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateBook = async (formData) => {
  // formData should contain: Id, Title, Description, ISBN, PublicationDate, Language, PageCount, Publisher, AuthorId, CoverImage (file)
  const response = await axiosClient.put('/books/update-book', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteBookAdmin = async (id) => {
  const response = await axiosClient.delete(`/admin/books/${id}`);
  return response.data;
};

// ==================== AUTHORS ====================
export const getAllAuthors = async (pageNumber = 1, pageSize = 10, searchTerm = '') => {
  const params = { pageNumber, pageSize };
  // Backend uses 'Query' parameter, not 'searchTerm'
  if (searchTerm) {
    params.query = searchTerm;
  }
  const response = await axiosClient.get('/authors/action/get-all-authors', { params });
  return response.data;
};

export const getAuthorById = async (id) => {
  const response = await axiosClient.get(`/authors/action/get-author-by-id/${id}`);
  return response.data;
};

export const createAuthor = async (formData) => {
  // formData should contain: Name, Bio, ProfilePicture (file)
  const response = await axiosClient.post('/authors/action/create-author', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateAuthor = async (formData) => {
  const response = await axiosClient.put('/authors/action/update-author', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteAuthor = async (id) => {
  const response = await axiosClient.delete(`/authors/action/delete-author/${id}`);
  return response.data;
};

// ==================== GENRES ====================
export const getAllGenres = async (pageNumber = 1, pageSize = 50, searchTerm = '') => {
  const params = { pageNumber, pageSize };
  // Backend uses 'Query' parameter, not 'searchTerm'
  if (searchTerm) {
    params.query = searchTerm;
  }
  const response = await axiosClient.get('/genres/get-all-genres', { params });
  return response.data;
};

export const getGenreById = async (id) => {
  const response = await axiosClient.get(`/genres/get-genre-by-id/${id}`);
  return response.data;
};

export const createGenre = async (name) => {
  const response = await axiosClient.post('/genres/create-genre', { name });
  return response.data;
};

export const updateGenre = async (id, name) => {
  const response = await axiosClient.put('/genres/update-genre', { id, name });
  return response.data;
};

export const deleteGenre = async (id) => {
  const response = await axiosClient.delete(`/genres/delete-genre/${id}`);
  return response.data;
};

// ==================== USERS ====================
export const getAllUsers = async (pageNumber = 1, pageSize = 10, searchTerm = '') => {
  const params = { pageNumber, pageSize };
  // Backend uses 'Query' parameter, not 'searchTerm'
  if (searchTerm) {
    params.query = searchTerm;
  }
  const response = await axiosClient.get('/users/get-all-users', { params });
  return response.data;
};

// Delete user (Admin only)
export const deleteUser = async (id) => {
  const response = await axiosClient.delete(`/admin/users/${id}`);
  return response.data;
};

// ==================== REVIEWS (Admin) ====================
export const deleteReviewAdmin = async (id) => {
  const response = await axiosClient.delete(`/admin/reviews/${id}`);
  return response.data;
};

// ==================== QUOTES (Admin) ====================
export const deleteQuoteAdmin = async (id) => {
  const response = await axiosClient.delete(`/admin/quotes/${id}`);
  return response.data;
};
