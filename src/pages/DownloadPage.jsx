import {
    useEffect,
    useState
} from "react";

import { ApiError } from "../services/ApiError";

import {
    useParams
} from "react-router-dom";

import {
    Box,
    CircularProgress,
    Container,
    Paper,
    Typography,
    Alert,
    Button
} from "@mui/material";

import {fetchDownloadData} from "../services/DownloadService";

export default function DownloadPage() {

    const { slug } = useParams();

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [downloadUrl, setDownloadUrl] =
        useState("");

    const [message, setMessage] =
        useState("");

    useEffect(() => {

        async function loadDownloadData() {

            try {

                const data =
                    await fetchDownloadData(slug);

                setDownloadUrl(
                    data.downloadUrl
                );

                setMessage(
                    data.message || ""
                );

            } catch (error) {

                console.error(error);

                if (error instanceof ApiError) {

                    if (error.status === 404) {

                        setError("File not found");

                    } else if (error.status === 429) {

                        setError("Too many requests");

                    } else if (error.status === 410) {

                        setError("File has expired");

                    } else {

                        setError(error.message);
                    }

                } else {

                    setError("Unexpected error");
                }

            } finally {

                setLoading(false);
            }
        }

        loadDownloadData();

    }, [slug]);

    function handleDownload() {

        globalThis.location.href =
            downloadUrl;
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#0f172a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 2
            }}
        >
            <Container maxWidth="sm">

                <Paper
                    elevation={5}
                    sx={{
                        padding: 5,
                        borderRadius: 4,
                        textAlign: "center"
                    }}
                >

                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        gutterBottom
                    >
                        TorqueShare
                    </Typography>

                    {loading && (
                        <>
                            <CircularProgress />

                            <Typography
                                sx={{ mt: 2 }}
                            >
                                Preparing download...
                            </Typography>
                        </>
                    )}

                    {!loading && error && (
                        <Alert severity="error">
                            {error}
                        </Alert>
                    )}

                    {!loading &&
                        !error &&
                        downloadUrl && (
                            <>

                                {message && (
                                    <Alert
                                        severity="info"
                                        sx={{
                                            mb: 3,
                                            textAlign: "left"
                                        }}
                                    >
                                        {message}
                                    </Alert>
                                )}

                                <Alert
                                    severity="success"
                                    sx={{ mb: 3 }}
                                >
                                    File ready for download
                                </Alert>

                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={
                                        handleDownload
                                    }
                                >
                                    Download File
                                </Button>

                            </>
                        )}

                </Paper>

            </Container>
        </Box>
    );
}