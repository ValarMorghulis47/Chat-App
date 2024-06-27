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

        sendFriendRequest: builder.mutation({       // Query for get request and mutaion for post, put and delete request
            query: (data) => ({
                url: 'user/sendFriend',
                method: 'PUT',
                credentials: 'include',
                body: data
            }),
            invalidatesTags: ['User']
        }),
    })
})

export default api;
export const { useGetMyChatsQuery, useLazySearchUserQuery, useSendFriendRequestMutation } = api;