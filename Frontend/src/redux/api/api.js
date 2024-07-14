import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


const api = createApi({
    reducerPath: 'api',  // name of the slice just like we do in createSlice
    baseQuery: fetchBaseQuery({ baseUrl: '/api/v1/' }),
    tagTypes: ['Chat', 'User', 'Message'],
    endpoints: (builder) => ({
        getMyChats: builder.query({
            query: () => ({
                url: 'chat/myChats',
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

        getNotifications: builder.query({
            query: () => ({
                url: 'user/notifications',
                credentials: 'include'
            }),
            keepUnusedDataFor: 0
        }),

        accpetFriendRequest: builder.mutation({
            query: (data) => ({
                url: 'user/acceptRejectFriend',
                method: 'PUT',
                credentials: 'include',
                body: data
            }),
            invalidatesTags: ['Chat']
        }),

        getChatDetails: builder.query({
            query: ({ chatId, populate = false }) => {
                let url = `chat/chatDetails/${chatId}`;
                if (populate) url += "?populate=true";

                return {
                    url,
                    credentials: "include",
                };
            },
            providesTags: ["Chat"],
        }),

        getMessages: builder.query({
            query: ({ chatId, page }) => ({
                url: `chat/getMessages/${chatId}?page=${page}`,
                credentials: 'include'
            }),
            keepUnusedDataFor: 0
        }),

        sendAttachments: builder.mutation({
            query: (data) => ({
                url: 'chat/sendAttachement',
                method: 'POST',
                credentials: 'include',
                body: data
            }),
        }),

        getMyGroups: builder.query({
            query: () => ({
                url: 'chat/myGroups',
                credentials: 'include'
            }),
            providesTags: ['Chat']
        }),

        getAvailableFriends: builder.query({
            query: (chatId) => {;
                let url = `user/allFriends`
                if (chatId) url += `?chatId=${chatId}`;

                return {
                    url,
                    credentials: "include",
                };
            },
            providesTags: ["Chat"],
        }),

        newGroup: builder.mutation({
            query: (data) => ({
                url: 'chat/newGroup',
                method: 'POST',
                credentials: 'include',
                body: data
            }),
            invalidatesTags: ['Chat']
        }),
    })
})

export default api;
export const {
    useGetMyChatsQuery,
    useLazySearchUserQuery,
    useSendFriendRequestMutation,
    useGetNotificationsQuery,
    useAccpetFriendRequestMutation,
    useGetChatDetailsQuery,
    useGetMessagesQuery,
    useSendAttachmentsMutation,
    useGetMyGroupsQuery,
    useGetAvailableFriendsQuery,
    useNewGroupMutation
} = api;