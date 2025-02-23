import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';
import { ChromePicker } from 'react-color';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const CreateModuleModal = ({ open, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#1a73e8');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, color });
    setName('');
    setColor('#1a73e8');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
    >
      <Box sx={style}>
        <Typography variant="h6" component="h2" gutterBottom>
          Module Creator
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
          />
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Module Color
            </Typography>
            <Box
              onClick={() => setShowColorPicker(!showColorPicker)}
              sx={{
                backgroundColor: color,
                width: '100%',
                height: 40,
                borderRadius: 1,
                cursor: 'pointer',
                border: '2px solid #ddd',
                '&:hover': {
                  opacity: 0.9,
                },
              }}
            />
            {showColorPicker && (
              <Box sx={{ position: 'absolute', zIndex: 2, mt: 1 }}>
                <Box
                  sx={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                  }}
                  onClick={() => setShowColorPicker(false)}
                />
                <ChromePicker
                  color={color}
                  onChange={(color) => setColor(color.hex)}
                />
              </Box>
            )}
          </Box>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              bgcolor: color,
              '&:hover': {
                bgcolor: color,
                opacity: 0.9,
              },
            }}
          >
            Save
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default CreateModuleModal;
