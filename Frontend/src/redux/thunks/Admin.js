import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const adminLogin = createAsyncThunk('admin/adminLogin', async (secretKey) => {
    try {
        const configOptions = {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        };
        const { data } = await axios.post('/api/v1/admin/adminLogin', {secretKey}, configOptions);
        return data.message;
    } catch (error) {
        throw error.response.data.message;
    }
});

const getAdmin = createAsyncThunk('admin/getAdmin', async () => {
    try {
        const configOptions = {
            withCredentials: true
        };
        const { data } = await axios.get('/api/v1/admin/checkAdmin', configOptions);
        return data.success;
    } catch (error) {
        throw error.response.data.message;
    }
});

const adminLogout = createAsyncThunk('admin/adminLogout', async () => {
    try {
        const configOptions = {
            withCredentials: true
        };
        const { data } = await axios.get('/api/v1/admin/adminLogout', configOptions);
        return data.message;
    } catch (error) {
        throw error.response.data.message;
    }
});

export { adminLogin, getAdmin, adminLogout };