import { useState } from "react";
import { ApiError } from "../services/ApiError";

import {
    Box,
    Button,
    Paper,
    Stack,
    TextField,
    Typography,
    Alert
} from "@mui/material";

import { generateUploadUrl } from "../services/UploadService";

const MAX_FILE_SIZE =
    500 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/pdf",
    "application/zip",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/matroska",
    "video/x-matroska"
]);

const SLUG_REGEX = /^[a-zA-Z0-9-_]+$/;

export default function UploadForm() {

    const [slugWord, setSlugWord] = useState("");
    const [message, setMessage] = useState("");
    const [file, setFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [downloadUrl, setDownloadUrl] = useState("");
    const [error, setError] = useState("");

    async function handleUpload() {

        setError("");
        setStatus("");
        setDownloadUrl("");

        if (!file) {
            setStatus("Please select a file");
            return;
        }

        if (!slugWord.trim()) {

            setStatus("Slug is required");
            return;
        }

        if (!SLUG_REGEX.test(slugWord)) {

            setError("Slug can only contain letters, numbers, - and _");
            return;
        }

        if (slugWord.length < 3 || slugWord.length > 50) {

            setError("Slug must be between 3 and 50 characters");
            return;
        }

        if (!ALLOWED_TYPES.has(file.type)) {

            setError("Unsupported file type");
            return;
        }

        if (file.size > MAX_FILE_SIZE) {

            setError("File size exceeds 500MB");
            return;
        }

        if (message.length > 500) {

            setStatus("Message too long");
            return;
        }

        try {

            setLoading(true);
            setStatus("Generating upload URL...");
            setError("");
            //backend call for presigned URL
            const data = await generateUploadUrl({
                originalWord: slugWord,
                contentType: file.type || "application/octet-stream",
                fileSize: file.size,
                message
            });

            setStatus("Uploading file to S3...");

            //Uploads file directly to S3 from frontend
            const uploadResponse = await fetch(
                data.uploadUrl,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            file.type || "application/octet-stream"
                    },
                    body: file
                }
            );

            if (!uploadResponse.ok) {
                throw new ApiError(
                    uploadResponse.status,
                    "S3_UPLOAD_FAILED",
                    "File upload failed"
                );
            }

            setStatus("Upload completed.");

            //Generates download endpoint
            setDownloadUrl(
                `https://torque-share.vercel.app/download/${data.slug}`
            );

        } catch (error) {

            if (error instanceof ApiError) {

                if (error.status === 404) {

                    setError("File not found");

                } else if (error.status === 429) {

                    setError("Too many requests");

                } else if(error.status === 400) {
                    
                    setError("invalid file size or file type");

                }else {

                    setError(error.message);
                }

            } else {

                setError("Unexpected error");
            }
        } finally {

            setLoading(false);
        }
    }

    return (
        <Paper
            elevation={4}
            sx={{
                padding: 4,
                borderRadius: 4
            }}
        >
            <Stack spacing={3}>

                <Typography
                    variant="h4"
                    fontWeight="bold"
                >
                    Upload File
                </Typography>

                <TextField
                    label="Slug Word"
                    value={slugWord}
                    onChange={(e) =>
                        setSlugWord(e.target.value)
                    }
                    fullWidth
                />

                <TextField
                    label="Optional Message"
                    value={message}
                    onChange={(e) =>
                        setMessage(e.target.value)
                    }
                    multiline
                    rows={3}
                    fullWidth
                />

                <Button
                    variant="outlined"
                    component="label"
                >SELECT FILE<input

                        hidden
                        type="file"
                        onChange={(e) =>setFile(e.target.files[0])}
                    />
                </Button>

                {file && (
                    <Box>
                        <Typography>
                            File: {file.name}
                        </Typography>

                        <Typography>
                            Type: {file.type || "unknown"}
                        </Typography>

                        <Typography>
                            Size:
                            {" "}
                            {(file.size / 1024).toFixed(2)}
                            {" "}KB
                        </Typography>
                    </Box>
                )}

                <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={loading}
                >
                    {loading
                        ? "Uploading..."
                        : "Upload"}
                </Button>

                {status && (
                    <Alert severity="info">
                        {status}
                    </Alert>
                )}

                {error && (
                    <Alert severity="error">
                        {error}
                    </Alert>
                )}

                {downloadUrl && (

                    <Alert severity="success">

                    <Typography
                        fontWeight="bold"
                        mb={2}
                    >
                        File uploaded successfully
                    </Typography>

                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                    >

                        <TextField
                            fullWidth
                            size="small"
                            value={downloadUrl}
                            InputProps={{
                                readOnly: true
                            }}
                        />

                        <Button
                            variant="contained"
                            onClick={async () => {

                                try {

                                    await navigator.clipboard.writeText(
                                        downloadUrl
                                    );

                                    setStatus("Link copied to clipboard");

                                } catch {

                                    setError("Failed to copy link");
                                }
                            }}
                        >Copy
                        </Button>

                    </Stack>

                </Alert>
            )}

            </Stack>
        </Paper>
    );
}