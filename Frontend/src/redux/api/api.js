import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


const api = createApi({
    reducerPath: 'api',  // name of the slice just like we do in createSlice
    baseQuery: fetchBaseQuery({ baseUrl: '/api/v1/'}),
    tagTypes: ['Chat'],
    endpoints: (builder) => ({
        getMyChats: builder.query({
            query: () => ({
                url : 'chat/myChats',
                credentials: 'include'
            }),
            providesTags: ['Chat']
        }),
    })
})

export default api;
export const { useGetMyChatsQuery } = api;