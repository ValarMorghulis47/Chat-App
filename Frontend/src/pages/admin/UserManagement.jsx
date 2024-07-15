import { Avatar, Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import Table from "../../components/shared/Table";
import Title from "../../components/shared/Title";
import { useErrors } from "../../hooks/hook";
import { transformImage } from "../../lib/features";
import { useGetAllUsersQuery } from "../../redux/api/api";

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
        renderCell: (params) => (
            <Avatar alt={params.row.name} src={params.row.avatar} />
        ),
    },

    {
        field: "username",
        headerName: "Name",
        headerClassName: "table-header",
        width: 200,
    },
    {
        field: "email",
        headerName: "Email",
        headerClassName: "table-header",
        width: 200,
    },
    {
        field: "totalFriends",
        headerName: "Friends",
        headerClassName: "table-header",
        width: 150,
    },
    {
        field: "totalGroups",
        headerName: "Groups",
        headerClassName: "table-header",
        width: 200,
    },
    {
        field: "createdAt",
        headerName: "Joined On",
        headerClassName: "table-header",
        width: 200,
        renderCell: (params) => (
            <>{new Date(params.row.createdAt).toDateString()}</>
        )
    },
];
const UserManagement = () => {
    const { data, isError, error, isLoading } = useGetAllUsersQuery();
    useErrors([{ isError, error }]);
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (data) {
            setRows(
                data?.data.map((i, index) => ({
                    username: i.user.username,
                    email: i.user.email,
                    createdAt: i.user.createdAt,
                    id: index + 1,
                    avatar: transformImage(i.user.avatar_url, 50),
                    ...i
                }))
            );
        }
    }, [data?.data]);

    return (
        <AdminLayout>
            <Title title={"User Management"} />
            {
                isLoading ? (
                    <Skeleton height={"100vh"} />
                ) : (
                    <Table heading={"All Users"} columns={columns} rows={rows} />
                )
            }
        </AdminLayout>
    );
};

export default UserManagement;