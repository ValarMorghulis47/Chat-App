import React, { useState } from 'react'
import { Container, Paper, Typography, TextField, Button, Stack, Avatar, IconButton } from '@mui/material'
import { CameraAlt as CameraAltIcon } from "@mui/icons-material";
import { VisuallyHiddenInput } from '../components/styles/StyledComponents';
import { useInputValidation, useStrongPassword } from '6pp';
import { usernameValidator } from '../utils/validators';
import { useEffect } from 'react';
import { bgGradient } from '../constants/color';
import Title from '../components/shared/Title';
import axios from 'axios';


function login() {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [avatarSizeError, setAvatarSizeError] = useState("");
    const [selectedFile, setSelectedFile] = useState();
    const [preview, setPreview] = useState();

    const email = useInputValidation("");
    const bio = useInputValidation("");
    const username = useInputValidation("", usernameValidator);
    const password = useStrongPassword();

    // create a preview as a side effect, whenever selected file is changed
    useEffect(() => {
        if (!selectedFile) {
            setPreview(undefined);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);
        console.log(selectedFile);

        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    const onSelectFile = (e) => {
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedFile(undefined);
            return;
        }

        // Check if the file size is within the limit
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
            // If the file size is larger than the limit, set the error message
            setAvatarSizeError("File size is larger than 10MB");
            return;
        } else {
            // If the file size is within the limit, clear the error message
            setAvatarSizeError("");
        }

        // I've kept this example simple by using the first image instead of multiple
        setSelectedFile(selectedFile);
    };

    const handleLogin = (e) => {
        e.preventDefault();

        setIsLoading(true);

        const configOption = {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        }

        axios.post('/api/v1/user/login', {
            email: email.value,
            password: password.value,
        }, configOption).then((res) => console.log(res)).catch((err) => console.log(err)).finally(() => setIsLoading(false));

    };

    function handleSignUp(e) {
        e.preventDefault();
    };

    return (
        <div
            style={{
                backgroundImage: bgGradient,
            }}
        >
            <Title title="Login" description="Login Page" />
            <Container component={"main"} maxWidth="xs" sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Paper elevation={3} sx={{ padding: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {isLoggedIn ? (
                        <>
                            <Typography variant="h5">Login</Typography>
                            <form style={{ width: "100%", marginTop: "1rem" }} onSubmit={handleLogin}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Email"
                                    margin="normal"
                                    variant="outlined"
                                    value={email.value}
                                    onChange={email.changeHandler}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    margin="normal"
                                    variant="outlined"
                                    value={password.value}
                                    onChange={password.changeHandler}
                                />
                                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: "1rem" }} disabled= {isLoading}>Login</Button>
                                <Typography textAlign={"center"} margin={"1rem"}>OR</Typography>
                                <Button variant="text" fullWidth onClick={() => setIsLoggedIn(false)}>Sign Up Instead</Button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Typography variant="h5">Sign Up</Typography>
                            <form style={{ width: "100%", marginTop: "1rem" }} onSubmit={handleSignUp}>
                                <Stack position={"relative"} width={"10rem"} margin={"auto"} direction="row" spacing={2}>
                                    <Avatar sx={{ width: "10rem", height: "10rem", objectFit: "contain" }} src={preview} />
                                    <IconButton sx={{
                                        position: "absolute",
                                        bottom: "0",
                                        right: "0",
                                        color: "white",
                                        bgcolor: "rgba(0,0,0,0.5)",
                                        ":hover": {
                                            bgcolor: "rgba(0,0,0,0.7)",
                                        },
                                    }}
                                        component="label">
                                        <>
                                            <CameraAltIcon />
                                            <VisuallyHiddenInput type="file" onChange={onSelectFile} />
                                        </>
                                    </IconButton>
                                </Stack>

                                {avatarSizeError && (
                                    <Typography
                                        m={"1rem auto"}
                                        width={"fit-content"}
                                        display={"block"}
                                        color="error"
                                        variant="caption"
                                    >
                                        {avatarSizeError}
                                    </Typography>
                                )}


                                <TextField
                                    required
                                    fullWidth
                                    label="Email"
                                    margin="normal"
                                    variant="outlined"
                                    value={email.value}
                                    onChange={email.changeHandler}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    label="Username"
                                    margin="normal"
                                    variant="outlined"
                                    value={username.value}
                                    onChange={username.changeHandler}
                                />

                                {username.error && (
                                    <Typography color="error" variant="caption">
                                        {username.error}
                                    </Typography>
                                )}

                                <TextField
                                    required
                                    fullWidth
                                    label="Bio"
                                    margin="normal"
                                    variant="outlined"
                                    value={bio.value}
                                    onChange={bio.changeHandler}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    margin="normal"
                                    variant="outlined"
                                    value={password.value}
                                    onChange={password.changeHandler}
                                />

                                {password.error && (
                                    <Typography color="error" variant="caption">
                                        {password.error}
                                    </Typography>
                                )}

                                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: "1rem" }}>Sign Up</Button>
                                <Typography textAlign={"center"} margin={"1rem"}>OR</Typography>
                                <Button variant="text" fullWidth onClick={() => setIsLoggedIn(true)}>Login</Button>
                            </form>
                        </>
                    )}
                </Paper>
            </Container>
        </div>
    )
}

export default login
