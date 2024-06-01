import React, { useState } from 'react'
import { Container, Paper, Typography, TextField, Button, Stack, Avatar, IconButton } from '@mui/material'
import CameraAltIcon from '@mui/icons-material/CameraAlt';
function login() {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    return (
        <Container component={"main"} maxWidth="xs" sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Paper elevation={3} sx={{ padding: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                {isLoggedIn ? (
                    <>
                        <Typography variant="h5">Login</Typography>
                        <form style={{ width: "100%", marginTop: "1rem" }}>
                            <TextField id="email" label="Email" variant="outlined" margin="normal" fullWidth required />
                            <TextField id="password" label="Password" variant="outlined" type="password" margin="normal" fullWidth required />
                            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: "1rem" }}>Login</Button>
                            <Typography textAlign={"center"} margin={"1rem"}>OR</Typography>
                            <Button variant="text" fullWidth onClick={() => setIsLoggedIn(false)}>Sign Up</Button>
                        </form>
                    </>
                ) : (
                    <>
                        <Typography variant="h5">Sign Up</Typography>
                        <form style={{ width: "100%", marginTop: "1rem" }}>
                            <Stack position={"relative"} width={"10rem"} margin={"auto"} direction="row" spacing={2}>
                                <Avatar sx={{ width: "10rem", height: "10rem", objectFit: "contain" }} />
                                <IconButton>
                                    <>
                                    <CameraAltIcon />
                                    <VisuallyHidden>Upload Image</VisuallyHidden>
                                    </>
                                </IconButton>
                            </Stack>
                            <TextField id="email" label="Email" variant="outlined" margin="normal" fullWidth required />
                            <TextField id="email" label="Username" variant="outlined" margin="normal" fullWidth required />
                            <TextField id="password" label="Password" variant="outlined" type="password" margin="normal" fullWidth required />
                            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: "1rem" }}>Login</Button>
                            <Typography textAlign={"center"} margin={"1rem"}>OR</Typography>
                            <Button variant="text" fullWidth onClick={() => setIsLoggedIn(true)}>Login</Button>
                        </form>
                    </>
                )}
            </Paper>
        </Container>
    )
}

export default login
