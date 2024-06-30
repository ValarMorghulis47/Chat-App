import {
  AttachFile as AttachFileIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { IconButton, Skeleton, Stack } from "@mui/material";
import { useInfiniteScrollTop } from '6pp'
import React, { Fragment, useCallback, useRef } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { grayColor, orange } from '../constants/color';
import { InputBox } from "../components/styles/StyledComponents";
import { useState } from "react";
import FileMenu from "../components/dialogue/FileMenu";
import MessageComponent from "../components/shared/MessageComponent";
import Title from "../components/shared/Title";
import { getSocket } from "../socket";
import { NEW_MESSAGE } from '../constants/events'
import { useGetChatDetailsQuery, useGetMessagesQuery } from "../redux/api/api";
import { useErrors, useSocketEvents } from "../hooks/hook";
import { useDispatch } from "react-redux";
import { setIsFileMenu } from "../redux/reducers/misc";

function Chat({ chatId, user }) {

  const dispatch = useDispatch();

  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);   // we will use this to store the messages of the chat
  const [page, setPage] = useState(1);


  const socket = getSocket();
  const containerRef = useRef(null);
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);
  const chatDetails = useGetChatDetailsQuery(chatId);   // we didn't destructured the data and erros becuase we will use it later
  const oldMessages = useGetMessagesQuery({ chatId, page});

  const {data: oldMessage, setdata: setOldMessage} = useInfiniteScrollTop(containerRef, oldMessages.data?.totalPages, page, setPage, oldMessages.data?.messages);

  const members = chatDetails.data?.members;

  const errors = [{ isError: chatDetails.isError, error: chatDetails.error },
    { isError: oldMessages.isError, error: oldMessages.error }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    socket.emit(NEW_MESSAGE, { chatId, members, message });
    setMessage('');
  };

  const handleFileMenuClick = (e) => {
    dispatch(setIsFileMenu(true));
    setFileMenuAnchor(e.currentTarget);
  };
  const newMessageHandler = useCallback((data) => {
    setChatMessages((prev) => [...prev, data.message]);
  })

  const eventHandlerObject = {
    [NEW_MESSAGE]: newMessageHandler
  }

  const allMessages = [...oldMessage, ...chatMessages];
  useSocketEvents(socket, eventHandlerObject);
  useErrors(errors);

  return (
    chatDetails.isLoading ? (<Skeleton />) : (<Fragment>
      <Title title={user.name} description="Chat Page" />
      <Stack
        ref={containerRef}
        boxSizing={"border-box"}
        padding={"1rem"}
        spacing={"1rem"}
        bgcolor={grayColor}
        height={"90%"}
        sx={{
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        {
          allMessages.map((message, index) => {
            return <MessageComponent key={index} message={message} user={user} />
          })
        }

      </Stack>
      <form
        style={{
          height: "10%",
        }}
        onSubmit={handleSubmit}
      >
        <Stack
          direction={"row"}
          height={"100%"}
          padding={"1rem"}
          alignItems={"center"}
          position={"relative"}
        >
          <IconButton
            sx={{
              position: "absolute",
              left: "1.5rem",
              rotate: "30deg",
            }}
            onClick={handleFileMenuClick}
          >
            <AttachFileIcon />
          </IconButton>

          <InputBox
            placeholder="Type Message Here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <IconButton
            type="submit"
            sx={{
              rotate: "-30deg",
              bgcolor: orange,
              color: "white",
              marginLeft: "1rem",
              padding: "0.5rem",
              "&:hover": {
                bgcolor: "error.dark",
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </form>
      <FileMenu anchorE1={fileMenuAnchor} chatId={chatId} />
    </Fragment>
    )
  );
};

export default AppLayout()(Chat);
