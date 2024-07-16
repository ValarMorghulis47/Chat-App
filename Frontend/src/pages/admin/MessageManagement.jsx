import { Avatar, Box, Skeleton, Stack } from "@mui/material";
import moment from "moment";
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import RenderAttachment from "../../components/shared/RenderAttachement";
import Table from "../../components/shared/Table";
import Title from "../../components/shared/Title";
import { dashboardData } from "../../constants/sampleData";
import { useErrors } from "../../hooks/hook";
import { fileFormat, transformImage } from "../../lib/features";
import { useGetAllMessagesQuery } from "../../redux/api/api";

const columns = [
    {
        field: "id",
        headerName: "ID",
        headerClassName: "table-header",
        width: 200,
    },
    {
        field: "Attachments",
        headerName: "Attachments",
        headerClassName: "table-header",
        width: 200,
        renderCell: (params) => {
            const { Attachments } = params.row;

            return Attachments?.length > 0
                ? Attachments.map((i) => {
                    const url = i.url;
                    const file = fileFormat(url);

                    return (
                        <Box style={{ marginTop: "20px" }}>
                            <a
                                href={url}
                                download
                                target="_blank"
                                style={{
                                    color: "black",
                                }}
                            >
                                {RenderAttachment(file, url)}
                            </a>
                        </Box>
                    );
                })
                : "No Attachments";
        },
    },

    {
        field: "content",
        headerName: "Content",
        headerClassName: "table-header",
        width: 400,
        renderCell: (params) => {
            const content = params.row.content;
            return content ? content : "No Content";
        },
    },
    {
        field: "sender",
        headerName: "Sent By",
        headerClassName: "table-header",
        width: 200,
        renderCell: (params) => (
            <Stack direction={"row"} spacing={"1rem"} alignItems={"center"}>
                <Avatar alt={params.row.sender.name} src={params.row.sender.avatar} />
                <span>{params.row.sender.name}</span>
            </Stack>
        ),
    },
    {
        field: "chat",
        headerName: "Chat",
        headerClassName: "table-header",
        width: 220,
    },
    {
        field: "groupChat",
        headerName: "Group Chat",
        headerClassName: "table-header",
        width: 100,
    },
    {
        field: "createdAt",
        headerName: "Time",
        headerClassName: "table-header",
        width: 250,
    },
];

const MessageManagement = () => {
    const { data, isError, error, isLoading } = useGetAllMessagesQuery();
    useErrors([{ isError, error }]);
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (data) {
            setRows(
                data.data.map((i, index) => ({
                    ...i,
                    id: index + 1,
                    groupChat: i.ChatDetails.groupChat,
                    chat: i.ChatDetails._id,
                    sender: {
                        name: i.SenderDetails.username,
                        avatar: transformImage(i.SenderDetails.avatar_url, 50),
                    },
                    createdAt: moment(i.createdAt).format("MMMM Do YYYY, h:mm:ss a"),
                }))
            );
        }
        
    }, [data?.data]);

    return (
        <AdminLayout>
            <Title title={"Message Management"} />
            {
                isLoading ? (
                    <Skeleton height={100} />
                ) : (
                    <Table
                        heading={"All Messages"}
                        columns={columns}
                        rows={rows}
                        rowHeight={200}
                    />
                )
            }
        </AdminLayout>
    );
};

export default MessageManagement;