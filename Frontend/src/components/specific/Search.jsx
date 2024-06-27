import { useInputValidation } from "6pp";
import { Search as SearchIcon } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  InputAdornment,
  List,
  Stack,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import UserItem from "../shared/UserItem";
import { sampleUsers } from "../../constants/sampleData";
import { useDispatch, useSelector } from "react-redux";
import { setIsSearch } from "../../redux/reducers/misc";
import { useLazySearchUserQuery } from "../../redux/api/api";

const Search = () => {

  const dispatch = useDispatch();
  const search = useInputValidation("");

  const { isSearch } = useSelector((state) => state.misc);

  const [searchUser] = useLazySearchUserQuery();  // You can use any name instead of searchUser

  const [users, setUsers] = useState([]);

  useEffect(() => {

    const setTimeoutId = setTimeout(() => {
      if (search.value.trim().length > 0) {          // we used this condition to prevent the API from being called when the input is empty
        searchUser(search.value)
          .then((res) => {
            setUsers(res.data.users);
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        setUsers([]);
      }
    }, 1000)

    return () => clearTimeout(setTimeoutId);

  }, [search.value]);

  const isLoadingSendFriendRequest = false;

  const addFriendHandler = async (id) => {
    console.log("Sending friend request");
  };

  const handleClose = () => {
    dispatch(setIsSearch(false));
  };

  return (
    <Dialog open={isSearch} onClose={handleClose}>
      <Stack p={"2rem"} direction={"column"} width={"25rem"}>
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

        {users.length > 0 ? (
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
        ) : (
          <p>No users found.</p>
        )}
      </Stack>
    </Dialog>
  );
};

export default Search;