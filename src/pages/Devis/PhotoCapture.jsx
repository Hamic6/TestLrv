import React, { useState } from 'react';
import { Button, Grid, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const PhotoCapture = ({ onPhotosCaptured }) => {
  const [photos, setPhotos] = useState([]);

  const onDrop = (acceptedFiles) => {
    const newPhotos = acceptedFiles.map(file => URL.createObjectURL(file));
    setPhotos([...photos, ...newPhotos]);
  };

  const savePhotos = (e) => {
    e.preventDefault();
    if (photos.length > 0) {
      onPhotosCaptured(photos);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
  });

  return (
    <div>
      <Box {...getRootProps({ className: 'dropzone' })} style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center' }}>
        <input {...getInputProps()} />
        <p>Glissez-déposez des fichiers ici, ou cliquez pour sélectionner des fichiers</p>
      </Box>
      <Grid container spacing={2} style={{ marginTop: '10px' }}>
        {photos.map((photo, index) => (
          <Grid item xs={6} md={3} key={index}>
            <img src={photo} alt={`Photo ${index + 1}`} style={{ width: '100%', maxWidth: '100px', marginBottom: '10px' }} />
          </Grid>
        ))}
      </Grid>
      {photos.length > 0 && (
        <StyledButton variant="contained" color="secondary" onClick={savePhotos} style={{ marginTop: '10px' }}>
          Sauvegarder les Photos
        </StyledButton>
      )}
    </div>
  );
};

export default PhotoCapture;
