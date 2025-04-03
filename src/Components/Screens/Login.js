import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    Link,
    Paper,
    CircularProgress,
    Alert,
    Snackbar,
    Grid,
    useTheme,
    useMediaQuery,
    InputAdornment,
    IconButton

} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import funlogo from "../Images/funparklogo.png";
import bgimg from "../Images/loginbackgroundimg.png";
import MGLogo from "../Images/MAGDUMLOGOWHITE.png";
import { Visibility, VisibilityOff } from "@mui/icons-material"; // Import the eye icons


const Login = ({ onLoginSuccess }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    const [showPassword, setShowPassword] = useState(false); // New state for password visibility

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        rememberMe: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    // Token validation function
    const validateToken = (token) => {
        if (!token) return false;
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp > currentTime;
        } catch (error) {
            return false;
        }
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };


    // Check for existing valid token on mount
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token && validateToken(token)) {
            navigate("/MatchSlots");
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
        setError(null);
    };

    const validateForm = () => {
        if (!formData.username.trim()) {
            setError("Username is required");
            return false;
        }
        if (!formData.password) {
            setError("Password is required");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setOpenSnackbar(true);
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                "https://msfunpark.com/funpark/api/user/login",
                {
                    username: formData.username,
                    password: formData.password,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    timeout: 10000,
                }
            );

            const { token, username } = response.data;

            // Validate the token structure before storing
            if (!token || !jwtDecode(token).exp) {
                throw new Error("Invalid token received");
            }

            localStorage.setItem("authToken", token);

            if (formData.rememberMe) {
                localStorage.setItem("rememberedUsername", username);
            } else {
                localStorage.removeItem("rememberedUsername");
            }

            // Call the onLoginSuccess callback if provided
            if (onLoginSuccess) {
                onLoginSuccess(token);
            }

            navigate("/MatchSlots", { state: { username } });

        } catch (err) {
            let errorMessage = "Login failed. Please try again.";

            if (err.response) {
                if (err.response.status === 401) {
                    errorMessage = "Invalid username or password";
                } else if (err.response.status === 400) {
                    errorMessage = "Invalid request format";
                } else if (err.response.status >= 500) {
                    errorMessage = "Server error. Please try again later.";
                }
            } else if (err.request) {
                errorMessage = "Network error. Please check your connection.";
            } else if (err.message === "Invalid token received") {
                errorMessage = "Authentication error. Please contact support.";
            }

            setError(errorMessage);
            setOpenSnackbar(true);
            setFormData(prev => ({ ...prev, password: "" }));

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const rememberedUsername = localStorage.getItem("rememberedUsername");
        if (rememberedUsername) {
            setFormData(prev => ({
                ...prev,
                username: rememberedUsername,
                rememberMe: true,
            }));
        }
    }, []);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                backgroundImage: `url(${bgimg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: isMobile ? "scroll" : "fixed",
                position: "relative",
                overflowX: "hidden",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    zIndex: 0,
                },
            }}
        >
            {/* Header with Logos - Modified for mobile view */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: "center",
                    justifyContent: isMobile ? "center" : "space-between",
                    pt: isMobile ? 2 : 4,
                    px: isMobile ? 2 : 4,
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {/* MG Logo - Always shown */}
                <Box
                    component="img"
                    src={MGLogo}
                    alt="Magdum Events"
                    sx={{
                        height: "auto",
                        width: isMobile ? "180px" : "270px",
                        maxWidth: "100%",
                        mb: isMobile ? 2 : 0,
                        filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.5))",
                    }}
                />

                {/* Fun Park Logo - Only shown in mobile view */}
                {isMobile && (
                    <Box
                        component="img"
                        src={funlogo}
                        alt="Fun Park"
                        sx={{
                            height: "auto",
                            width: "200px",
                            maxWidth: "100%",
                            filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.5))",
                        }}
                    />
                )}
            </Box>

            {/* Main Content Area */}
            <Box
                sx={{
                    display: "flex",
                    flexGrow: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: isTablet ? "column" : "row",
                    zIndex: 1,

                }}
            >
                {/* Fun Park Logo - Hidden on mobile (since we show it in header), shown on tablet/desktop */}
                {!isMobile && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: isTablet ? 0 : 4,
                            mb: isTablet ? 4 : 0,
                            flexShrink: 0,
                        }}
                    >
                        <Box
                            component="img"
                            src={funlogo}
                            alt="Fun Park"
                            sx={{
                                height: isTablet ? "300px" : "450px",
                                width: isTablet ? "300px" : "450px",
                                maxWidth: "100%",
                                objectFit: "contain",
                                transition: "all 0.3s ease",
                            }}
                        />
                    </Box>
                )}

                <Paper
                    sx={{
                        padding: isMobile ? 3 : 4,
                        borderRadius: 2,
                        backgroundColor: "transparent",
                        width: "100%",
                        maxWidth: isMobile ? "110%" : "400px",
                        ml: isTablet ? "-5%" : isMobile ? "-2%" : "15%",
                        mt: isTablet ? "-15%" : "-10%",

                    }}
                >
                    <Typography
                        variant={isMobile ? "h5" : "h4"}
                        component="h2"
                        sx={{
                            color: "white",
                            fontWeight: "bold",
                            textAlign: "center",
                            mb: 3,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                        }}
                    >
                        Sign In
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Username"
                            variant="outlined"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={loading}
                            sx={{
                                mb: 3,
                                "& .MuiOutlinedInput-root": {
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                    color: "white",
                                    "& fieldset": {
                                        borderColor: "rgba(255,255,255,0.3)",
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "rgba(255,255,255,0.5)",
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#2196F3",
                                    },
                                },
                                "& .MuiInputLabel-root": {
                                    color: "rgba(255,255,255,0.7)",
                                },
                            }}
                            InputProps={{
                                style: {
                                    fontSize: isMobile ? "0.9rem" : "1rem",
                                }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? "text" : "password"} // Toggle between text and password
                            variant="outlined"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            sx={{
                                mb: 3,
                                "& .MuiOutlinedInput-root": {
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                    color: "white",
                                    "& fieldset": {
                                        borderColor: "rgba(255,255,255,0.3)",
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "rgba(255,255,255,0.5)",
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#2196F3",
                                    },
                                },
                                "& .MuiInputLabel-root": {
                                    color: "rgba(255,255,255,0.7)",
                                },
                            }}
                            InputProps={{
                                style: {
                                    fontSize: isMobile ? "0.9rem" : "1rem",
                                },
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                            sx={{ color: "rgba(255,255,255,0.7)" }}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        {/* <Grid container alignItems="center" justifyContent="space-between" mb={3}>
                            <Grid item>
                                <Link href="#" sx={{ color: "white", textDecoration: "none" }}>
                                    Forgot password?
                                </Link>
                            </Grid>
                        </Grid> */}
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            fullWidth
                            sx={{
                                borderRadius: 1,
                                padding: isMobile ? "12px" : "16px",
                                background: "linear-gradient(45deg, #2196F3, #00BCD4)",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: isMobile ? "0.9rem" : "1rem",
                                "&:hover": {
                                    background: "linear-gradient(45deg, #1976D2, #0097A7)",
                                },
                                "&:disabled": {
                                    background: "rgba(255,255,255,0.2)",
                                },
                                transition: "all 0.3s ease",
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                "Log In"
                            )}
                        </Button>
                    </form>
                </Paper>
            </Box>

            {/* Mobile Footer (if needed) */}
            {isMobile && (
                <Box sx={{
                    py: 2,
                    textAlign: "center",
                    zIndex: 1,
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "0.8rem",
                }}>
                    <Typography variant="body2">
                        © {new Date().getFullYear()} Fun Park. All rights reserved.
                    </Typography>
                </Box>
            )}

            {/* Error Snackbar */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{
                    vertical: isMobile ? "bottom" : "top",
                    horizontal: "center"
                }}
                sx={{
                    mb: isMobile ? 8 : 0
                }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity="error"
                    sx={{
                        width: "100%",
                        fontSize: isMobile ? "0.8rem" : "0.9rem"
                    }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Login;