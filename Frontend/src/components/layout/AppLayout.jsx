import { Drawer, Grid, Skeleton } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { CHAT_JOINED, CHAT_LEAVED, NEW_MESSAGE_ALERT, NEW_REQUEST, ONLINE_USERS, REFETCH_CHATS } from '../../constants/events';
import { useErrors, useSocketEvents } from '../../hooks/hook';
import { getOrSaveFromStorage } from '../../lib/features';
import { useGetMyChatsQuery } from '../../redux/api/api';
import { incrementNotification, setNewMessagesAlert } from '../../redux/reducers/chat';
import { setIsDeleteMenu, setIsMobile, setSelectedDeleteChat } from '../../redux/reducers/misc';
import { getSocket } from '../../socket';
import Title from '../shared/Title';
import ChatList from '../specific/ChatList';
import Profile from '../specific/Profile';
import Header from './Header';
import DeleteChatMenu from "../dialogue/DeleteChatMenu";

const AppLayout = () => (WrappedComponent) => {
    return (props) => {

        const dispatch = useDispatch();
        const navigate = useNavigate();
        const deleteMenuAnchor = useRef(null);
        const [onlineUsers, setOnlineUsers] = useState([]);

        const { user } = useSelector(state => state.auth);
        const { isMobile } = useSelector(state => state.misc);
        const { newMessagesAlert } = useSelector(state => state.chat);

        const socket = getSocket();

        const params = useParams();
        const chatId = params.chatId;

        const { isLoading, isError, error, data, refetch } = useGetMyChatsQuery();

        useErrors([{ isError, error }]);

        useEffect(() => {
            getOrSaveFromStorage({key: NEW_MESSAGE_ALERT, value: newMessagesAlert});
        }, [newMessagesAlert])

        useEffect(() => {
            socket.emit(CHAT_JOINED, {userId: user._id});
            refetch();
            return () => {
                socket.emit(CHAT_LEAVED, {userId: user._id});
            };
        }, []);


        const handleDeleteChat = (e, chatId, groupChat) => {
            dispatch(setIsDeleteMenu(true));
            dispatch(setSelectedDeleteChat({ chatId, groupChat }));
            deleteMenuAnchor.current = e.currentTarget;
        };

        const handleMobileClose = () => {
            dispatch(setIsMobile(false));
        };

        const newMessageAlertListener = useCallback((data) => {
            if (data.chatId === chatId) return;
            dispatch(setNewMessagesAlert(data));
        }, [chatId]);

        const newRequestListener = useCallback((data) => {
            dispatch(incrementNotification());
        }, []);

        const onlineUsersListener = useCallback((data) => {
            setOnlineUsers(data);
        }, []);

        const refetchListener = useCallback(() => {
            refetch();
            navigate('/');
        }, [refetch, navigate]);

        const eventHandlers = {
            [NEW_MESSAGE_ALERT] : newMessageAlertListener,
            [NEW_REQUEST] : newRequestListener,
            [REFETCH_CHATS]: refetchListener,
            [ONLINE_USERS]: onlineUsersListener
        };

        useSocketEvents(socket, eventHandlers);

        return (
            <>
                <Title title='Chat App - The Best Chat App In THe World' />
                <Header />

                <DeleteChatMenu dispatch={dispatch} deleteMenuAnchor={deleteMenuAnchor} />

                {isLoading ? (
                    <Skeleton />
                ) : (
                    <Drawer open={isMobile} onClose={handleMobileClose}>
                        <ChatList
                            w="70vw"
                            chats={data?.data}
                            chatId={chatId}
                            handleDeleteChat={handleDeleteChat}
                            newMessagesAlert={newMessagesAlert}
                            onlineUsers={onlineUsers}
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
                            isLoading ? (<Skeleton />) : (<ChatList chats={data?.data} chatId={chatId} handleDeleteChat={handleDeleteChat} newMessagesAlert={newMessagesAlert} onlineUsers={onlineUsers} />)
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
