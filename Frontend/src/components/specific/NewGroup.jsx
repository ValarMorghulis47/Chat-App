import { useInputValidation } from "6pp";
import {
  Button,
  Dialog,
  DialogTitle,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UserItem from "../shared/UserItem";
import { useGetAvailableFriendsQuery, useNewGroupMutation } from '../../redux/api/api';
import { useAsyncMutation, useErrors } from '../../hooks/hook';
import { setIsNewGroup } from "../../redux/reducers/misc";
import toast from "react-hot-toast";

const NewGroup = () => {

  const dispatch = useDispatch();
  const { isNewGroup } = useSelector((state) => state.misc);

  const {isError, error, isLoading, data} = useGetAvailableFriendsQuery();
  const [newGroup, isLoadingNewGroup] = useAsyncMutation(useNewGroupMutation);
  const groupName = useInputValidation("");

  const [selectedMembers, setSelectedMembers] = useState([]);

  const selectMemberHandler = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id)
        ? prev.filter((currElement) => currElement !== id)
        : [...prev, id]
    );
  };

  useErrors([{isError, error}]);

  const submitHandler = () => {
    if (groupName.value === "") 
      return toast.error("Group name is required");
    if (selectedMembers.length < 2)
      return toast.error("Group must have at least 3 members");

    newGroup("Creating Group...", {name: groupName.value, members: selectedMembers});
    closeHandler();
  };

  const closeHandler = () => {
    dispatch(setIsNewGroup(false));
  };

  return (
    <Dialog onClose={closeHandler} open={isNewGroup}>
      <Stack p={{ xs: "1rem", sm: "3rem" }} width={"25rem"} spacing={"2rem"}>
        <DialogTitle textAlign={"center"} variant="h4">
          New Group
        </DialogTitle>

        <TextField
          label="Group Name"
          value={groupName.value}
          onChange={groupName.changeHandler}
        />

        <Typography variant="body1">Members</Typography>

        <Stack>
          {
            isLoading ? ( <Skeleton /> ) : (
            data?.friends?.map((i) => (
              <UserItem
                user={i.onemore}
                key={i.onemore._id}
                handler={selectMemberHandler}
                isAdded={selectedMembers.includes(i.onemore._id)}
              />
            ))
          )
          }
        </Stack>

        <Stack direction={"row"} justifyContent={"space-evenly"}>
          <Button
            variant="text"
            color="error"
            size="large"
            onClick={closeHandler}
            disabled={isLoadingNewGroup}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={submitHandler}
            disabled={isLoadingNewGroup}
          >
            Create
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default NewGroup;