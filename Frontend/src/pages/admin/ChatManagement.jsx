
import { Avatar, Skeleton, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import AvatarCard from "../../components/shared/AvatarCard";
import Table from "../../components/shared/Table";
import Title from "../../components/shared/Title";
import { useErrors } from "../../hooks/hook";
import { transformImage } from "../../lib/features";
import { useGetAllChatsQuery } from "../../redux/api/api";

const columns = [
    {
        field: "id",
        headerName: "ID",
        headerClassName: "table-header",
        width: 200,
    },
    {
        field: "avatar",
        headerName: "Avatar",
        headerClassName: "table-header",
        width: 150,
        renderCell: (params) => <AvatarCard avatar={params.row.avatar} />,
    },

    {
        field: "name",
        headerName: "Name",
        headerClassName: "table-header",
        width: 300,
    },

    {
        field: "groupChat",
        headerName: "Group Chat",
        headerClassName: "table-header",
        width: 150,
        renderCell: (params) => (
            <Stack direction="row" alignItems="center" spacing={"1rem"}>
                {params.row.groupChat ? "Yes" : "No"}
            </Stack>
        ),
    },
    {
        field: "TotalMembers",
        headerName: "Total Members",
        headerClassName: "table-header",
        width: 120,
    },
    {
        field: "members",
        headerName: "Members",
        headerClassName: "table-header",
        width: 400,
        renderCell: (params) => (
            <AvatarCard max={100} avatar={params.row.members} />
        ),
    },
    {
        field: "TotalMessages",
        headerName: "Total Messages",
        headerClassName: "table-header",
        width: 120,
    },
    {
        field: "CreatorDetails",
        headerName: "Created By",
        headerClassName: "table-header",
        width: 250,
        renderCell: (params) => (
            <Stack direction="row" alignItems="center" spacing={"1rem"}>
                <Avatar alt={params.row.CreatorDetails.username} src={params.row.CreatorDetails.avatar_url} />
                <span>{params.row.CreatorDetails.username}</span>
            </Stack>
        ),
    },
];

const ChatManagement = () => {
    const { data, isError, error, isLoading } = useGetAllChatsQuery();
    useErrors([{ isError, error }]);
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (data) {
            setRows(
                data.data.map((i, index) => ({
                    ...i,
                    id: index + 1,
                    avatar: i.avatars.map((i) => transformImage(i, 50)),
                    members: i.MemberDetails.map((i) => transformImage(i.avatar_url, 50)),
                }))
            );
        }
    }, [data?.data]);

    return (
        <AdminLayout>
            <Title title="Chat Management" />
            {isLoading ? (
                <Skeleton height={"100vh"} />
            ) : (
                <Table heading={"All Chats"} columns={columns} rows={rows} />
            )
            }
        </AdminLayout>
    );
};

export default ChatManagement;
