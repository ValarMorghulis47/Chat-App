import {
    Button,
    Dialog,
    DialogTitle,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAsyncMutation, useErrors } from "../../hooks/hook";
import { useAddMembersMutation, useGetAvailableFriendsQuery } from "../../redux/api/api";
import { setIsAddMember } from "../../redux/reducers/misc";
import UserItem from "../shared/UserItem";
const AddMemberDialog = ({ chatId }) => {

    const dispatch = useDispatch();

    const { isError, error, isLoading, data } = useGetAvailableFriendsQuery(chatId);
    const [adding, isLoadingAddMembers] = useAsyncMutation(useAddMembersMutation);
    const { isAddMember } = useSelector((state) => state.misc);
    const [selectedMembers, setSelectedMembers] = useState([]);

    const selectMemberHandler = (id) => {
        setSelectedMembers((prev) =>
            prev.includes(id)
                ? prev.filter((currElement) => currElement !== id)
                : [...prev, id]
        );
    };
    useErrors([{ isError, error }]);

    const closeHandler = () => {
        setSelectedMembers([]);
        dispatch(setIsAddMember(false));
    };
    const addMemberSubmitHandler = () => {
        adding("Adding Members", { chatId, members: selectedMembers });
        closeHandler();
    };
    return (
        <Dialog open={isAddMember} onClose={closeHandler}>
            <Stack p={"2rem"} width={"20rem"} spacing={"2rem"}>
                <DialogTitle textAlign={"center"}>Add Member</DialogTitle>
                {isLoading ? (
                    <Skeleton />
                ) : (
                    <Stack spacing={"1rem"}>
                        {data?.friends?.length > 0 ? (
                            data?.friends?.map((i) => (
                                <UserItem
                                    key={i._id}
                                    user={i.onemore}
                                    handler={selectMemberHandler}
                                    isAdded={selectedMembers.includes(i.onemore._id)}
                                />
                            ))
                        ) : (
                            <Typography textAlign={"center"}>No Friends</Typography>
                        )}
                    </Stack>)}


                <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"space-evenly"}
                >
                    <Button color="error" onClick={closeHandler} disabled={isLoadingAddMembers}>
                        Cancel
                    </Button>
                    <Button
                        onClick={addMemberSubmitHandler}
                        variant="contained"
                        disabled={isLoadingAddMembers}
                    >
                        Submit Changes
                    </Button>
                </Stack>
            </Stack>
        </Dialog>
    );
};

export default AddMemberDialog;