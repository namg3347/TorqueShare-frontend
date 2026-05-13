import {
    Box,
    Container
} from "@mui/material";

import UploadForm from "../components/UploadForm";

export default function HomePage() {

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#0f172a",
                paddingTop: 10
            }}
        >
            <Container maxWidth="md">
                <UploadForm />
            </Container>
        </Box>
    );
}