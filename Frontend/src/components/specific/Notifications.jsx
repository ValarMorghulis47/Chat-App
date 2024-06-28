import {
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  ListItem,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import React, { memo } from "react";
import { useAccpetFriendRequestMutation, useGetNotificationsQuery } from "../../redux/api/api";
import { useAsyncMutation, useErrors } from "../../hooks/hook";
import { useDispatch, useSelector } from "react-redux";
import { setIsNotification } from "../../redux/reducers/misc";

const Notifications = () => {

  const dispatch = useDispatch();
  const { isNotification } = useSelector((state) => state.misc);
  const { data, isError, error, isLoading } = useGetNotificationsQuery();
  const [acceptRequest] = useAsyncMutation(useAccpetFriendRequestMutation);

  useErrors([{ isError, error }]);

  const friendRequestHandler = async ({ _id, accept }) => {
    dispatch(setIsNotification(false));
    await acceptRequest('Accepting Friend Request', { requestId: _id, accept });
  };

  const closeHandler = () => {
    dispatch(setIsNotification(false));
  }

  return (
    <Dialog open={isNotification} onClose={closeHandler} >
      <Stack p={{ xs: "1rem", sm: "2rem" }} maxWidth={"25rem"}>
        <DialogTitle>Notifications</DialogTitle>
        {
          isLoading ? (
            <Skeleton />
          ) : (
            <>
              {data?.requests.length > 0 ? (
                data?.requests?.map(({ sender, _id }) => (
                  <NotificationItem
                    sender={sender}
                    _id={_id}
                    handler={friendRequestHandler}
                    key={_id}
                  />
                ))
              ) : (
                <Typography textAlign={"center"}>No New Notifications</Typography>
              )}
            </>
          )}
      </Stack>
    </Dialog>
  );
};

const NotificationItem = memo(({ sender, _id, handler }) => {
  const { username, avatar_url } = sender;
  return (
    <ListItem>
      <Stack
        direction={"row"}
        alignItems={"center"}
        spacing={"1rem"}
        width={"100%"}
      >
        <Avatar src={avatar_url} />

        <Typography
          variant="body1"
          sx={{
            flexGlow: 1,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
          }}
        >
          {`${username} sent you a friend request.`}
        </Typography>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
        >
          <Button onClick={() => handler({ _id, accept: true })}>Accept</Button>
          <Button color="error" onClick={() => handler({ _id, accept: false })}>
            Reject
          </Button>
        </Stack>
      </Stack>
    </ListItem>
  );
});

export default Notifications;