import React from 'react';
import Title from '../shared/Title';
import Header from './Header';
import { Grid, Skeleton } from "@mui/material";
import ChatList from '../specific/ChatList';
import { sampleChats } from '../../constants/sampleData';
import { useParams } from 'react-router-dom';
import Profile from '../specific/Profile';
import { useSelector } from 'react-redux';
import { useGetMyChatsQuery } from '../../redux/api/api';

const AppLayout = () => (WrappedComponent) => {
    return (props) => {

        const params = useParams();
        const chatId = params.chatId;

        const { isLoading, isError, error, data, refetch } = useGetMyChatsQuery();
        console.log("Data", data?.data);
        const { user } = useSelector(state => state.auth);

        const handleDeleteChat = (e, _id, groupChat) => {
            e.preventDefault();
            console.log("Delete Chat", _id, groupChat);
        };

        return (
            <>
                <Title title='Chat App - The Best Chat App In THe World' />
                <Header />

                <Grid container height={"calc(100vh - 4rem)"}>
                    <Grid
                        item
                        sm={4}
                        md={3}
                        sx={{
                            display: { xs: "none", sm: "block" },
                        }}
                        height={"100%"}
                    >
                        {
                            isLoading ? (<Skeleton />) : (<ChatList chats={data?.data} chatId={chatId} handleDeleteChat={handleDeleteChat} />)
                        }
                    </Grid>
                    <Grid item xs={12} sm={8} md={5} lg={6} height={"100%"}>
                        <WrappedComponent {...props} />
                    </Grid>

                    <Grid
                        item
                        md={4}
                        lg={3}
                        height={"100%"}
                        sx={{
                            display: { xs: "none", md: "block" },
                            padding: "2rem",
                            bgcolor: "rgba(0,0,0,0.85)",
                        }}
                    >
                        <Profile user={user} />
                    </Grid>
                </Grid>
            </>
        )
    }
}

export default AppLayout
