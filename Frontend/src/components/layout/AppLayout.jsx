import React, { useCallback } from 'react';
import Title from '../shared/Title';
import Header from './Header';
import { Grid, Skeleton, Drawer } from "@mui/material";
import ChatList from '../specific/ChatList';
import { useParams } from 'react-router-dom';
import Profile from '../specific/Profile';
import { useDispatch, useSelector } from 'react-redux';
import { useGetMyChatsQuery } from '../../redux/api/api';
import { setIsMobile, setIsNotification } from '../../redux/reducers/misc';
import { useErrors, useSocketEvents } from '../../hooks/hook';
import { getSocket } from '../../socket';
import { NEW_MESSAGE_ALERT, NEW_REQUEST } from '../../constants/events';
import { incrementNotification } from '../../redux/reducers/chat';

const AppLayout = () => (WrappedComponent) => {
    return (props) => {

        const dispatch = useDispatch();

        const socket = getSocket();

        const params = useParams();
        const chatId = params.chatId;

        const { isLoading, isError, error, data, refetch } = useGetMyChatsQuery();

        useErrors([{ isError, error }]);

        const { user } = useSelector(state => state.auth);
        const { isMobile } = useSelector(state => state.misc);

        const handleDeleteChat = (e, _id, groupChat) => {
            e.preventDefault();
            console.log("Delete Chat", _id, groupChat);
        };

        const handleMobileClose = () => {
            dispatch(setIsMobile(false));
        };

        const newMessageAlertListener = useCallback((data) => {
            console.log("New Message Alert", data);
        }, []);

        const newRequestListener = useCallback(() => {
            dispatch(incrementNotification());
        }, []);

        const eventHandlers = {
            [NEW_MESSAGE_ALERT] : newMessageAlertListener,
            [NEW_REQUEST] : newRequestListener
        };

        useSocketEvents(socket, eventHandlers);

        return (
            <>
                <Title title='Chat App - The Best Chat App In THe World' />
                <Header />

                {isLoading ? (
                    <Skeleton />
                ) : (
                    <Drawer open={isMobile} onClose={handleMobileClose}>
                        <ChatList
                            w="70vw"
                            chats={data?.data}
                            chatId={chatId}
                            handleDeleteChat={handleDeleteChat}
                        />
                    </Drawer>
                )}

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
                        <WrappedComponent {...props} chatId={chatId} user={user} />
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
