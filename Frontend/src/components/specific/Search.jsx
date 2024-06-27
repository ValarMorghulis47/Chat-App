import { useInputValidation } from "6pp";
import { Search as SearchIcon } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  InputAdornment,
  List,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import UserItem from "../shared/UserItem";
import { useDispatch, useSelector } from "react-redux";
import { setIsSearch } from "../../redux/reducers/misc";
import { useLazySearchUserQuery, useSendFriendRequestMutation } from "../../redux/api/api";
import { useAsyncMutation } from "../../hooks/hook";

const Search = () => {

  const dispatch = useDispatch();
  const search = useInputValidation("");

  const { isSearch } = useSelector((state) => state.misc);

  const [searchUser] = useLazySearchUserQuery();  // You can use any name instead of searchUser

  const [sendFriendRequest, isLoadingSendFriendRequest] = useAsyncMutation(useSendFriendRequestMutation);

  const [users, setUsers] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {

    const setTimeoutId = setTimeout(() => {
      if (search.value.trim().length > 0) {          // we used this condition to prevent the API from being called when the input is empty
        searchUser(search.value)
          .then((res) => {
            setUsers(res.data.users);
            setSearchPerformed(true);
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        setUsers([]);
        setSearchPerformed(false);
      }
    }, 1000)

    return () => clearTimeout(setTimeoutId);

  }, [search.value]);

  const addFriendHandler = async (id) => {
    await sendFriendRequest("Sending Friend Request...", { receiverId: id });
  };

  const handleClose = () => {
    dispatch(setIsSearch(false));
  };

  return (
    <Dialog open={isSearch} onClose={handleClose}>
      <Stack p={"2rem"} direction={"column"} width={"25rem"} spacing={2}>
        <DialogTitle textAlign={"center"}>Find People</DialogTitle>
        <TextField
          label=""
          value={search.value}
          onChange={search.changeHandler}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {searchPerformed && users.length === 0 ? (
          <Typography textAlign={"center"}>No users found.</Typography>
        ) : (
          <List>
            {users.map((i) => (
              <UserItem
                user={i}
                key={i._id}
                handler={addFriendHandler}
                handlerIsLoading={isLoadingSendFriendRequest}
              />
            ))}
          </List>
        )}
      </Stack>
    </Dialog>
  );
};

export default Search;