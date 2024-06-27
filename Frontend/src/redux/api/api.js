import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


const api = createApi({
    reducerPath: 'api',  // name of the slice just like we do in createSlice
    baseQuery: fetchBaseQuery({ baseUrl: '/api/v1/'}),
    tagTypes: ['Chat', 'User'],
    endpoints: (builder) => ({
        getMyChats: builder.query({
            query: () => ({
                url : 'chat/myChats',
                credentials: 'include'
            }),
            providesTags: ['Chat']
        }),

        searchUser: builder.query({
            query: (name) => ({
                url: `user/search?username=${name}`,
                credentials: 'include'
            }),
            providesTags: ['User']
        }),
    })
})

export default api;
export const { useGetMyChatsQuery, useLazySearchUserQuery } = api;