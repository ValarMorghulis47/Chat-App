import { useFetchData } from "6pp";
import { Avatar, Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import Table from "../../components/shared/Table";
import { transformImage } from "../../lib/features";
import { dashboardData } from "../../constants/sampleData";
import Title from "../../components/shared/Title";

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
        field: "name",
        headerName: "Name",
        headerClassName: "table-header",
        width: 200,
    },
    {
        field: "username",
        headerName: "Username",
        headerClassName: "table-header",
        width: 200,
    },
    {
        field: "friends",
        headerName: "Friends",
        headerClassName: "table-header",
        width: 150,
    },
    {
        field: "groups",
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

    const [rows, setRows] = useState([]);

    useEffect(() => {
        setRows(
            dashboardData.users.map((i) => ({
                ...i,
                id: i._id,
                avatar: transformImage(i.avatar, 50),
            }))
        );
    }, [dashboardData.users]);

    return (
        <AdminLayout>
            <Title title={"User Management"} />
            <Table heading={"All Users"} columns={columns} rows={rows} />
        </AdminLayout>
    );
};

export default UserManagement;