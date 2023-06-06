import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8000/api',
  //baseUrl: 'https://employees-vbhk.onrender.com/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.user?.accessToken
    //|| localStorage.getItem('token');
    console.log('services/api',token)
    
    if (token && token !== null) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  },
});

const baseQueryWithRetry = retry(baseQuery, { maxRetries: 1 });

export const api = createApi({
  reducerPath: 'splitApi',
  baseQuery: baseQueryWithRetry,
  refetchOnMountOrArgChange: true,
  endpoints: () => ({}),
});
