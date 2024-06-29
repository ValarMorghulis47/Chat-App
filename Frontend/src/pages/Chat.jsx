import {
  AttachFile as AttachFileIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { IconButton, Skeleton, Stack } from "@mui/material";
import React, { Fragment, useCallback, useRef } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { grayColor, orange } from '../constants/color';
import { InputBox } from "../components/styles/StyledComponents";
import { useState } from "react";
import FileMenu from "../components/dialogue/FileMenu";
import { sampleMessage } from "../constants/sampleData";
import MessageComponent from "../components/shared/MessageComponent";
import Title from "../components/shared/Title";
import { getSocket } from "../socket";
import { NEW_MESSAGE } from '../constants/events'
import { useGetChatDetailsQuery } from "../redux/api/api";
import { useErrors, useSocketEvents } from "../hooks/hook";

function Chat({ chatId, user }) {

  const socket = getSocket();
  const containerRef = useRef(null);
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);
  const chatDetails = useGetChatDetailsQuery(chatId);   // we didn't destructured the data and erros becuase we will use it later
  const members = chatDetails.data?.members;

  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);   // we will use this to store the messages of the chat

  const errors = [{ isError: chatDetails.isError, error: chatDetails.error }];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    socket.emit(NEW_MESSAGE, { chatId, members, message });
    setMessage('');
  };

  const newMessageHandler = useCallback((data) => {
    setChatMessages((prev) => [...prev, data.message]);
  })

  const eventHandlerObject = {
    [NEW_MESSAGE]: newMessageHandler
  }

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
          chatMessages.map((message, index) => {
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
      <FileMenu anchorE1={fileMenuAnchor} />
    </Fragment>
    )
  );
};

export default AppLayout()(Chat);
