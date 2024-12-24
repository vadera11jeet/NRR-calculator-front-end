import { Box, Button, Modal, Typography } from "@mui/material";

// eslint-disable-next-line
const ResultModal = ({ setOpen, open, result }) => {
  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          Result
        </Typography>
        <Typography variant="subtitle1">{result}</Typography>

        <Button
          onClick={() => setOpen(false)}
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default ResultModal;
