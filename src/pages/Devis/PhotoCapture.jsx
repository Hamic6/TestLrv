import React, { useRef, useState } from 'react';
import { Button, Grid, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const PhotoCapture = ({ onPhotosCaptured }) => {
  const videoRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [stream, setStream] = useState(null);

  const startCamera = (e) => {
    e.preventDefault();
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
        setStream(stream);
      })
      .catch(err => console.error("Erreur d'accès à l'appareil photo: ", err));
  };

  const stopCamera = (e) => {
    e.preventDefault();
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = (e) => {
    e.preventDefault();
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const photoData = canvas.toDataURL('image/png');
    if (photos.length < 4) {
      setPhotos([...photos, photoData]);
    }
  };

  const savePhotos = (e) => {
    e.preventDefault();
    if (photos.length > 0) {
      onPhotosCaptured(photos);
    }
  };

  return (
    <div>
      <Box className="photo-container" style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>
        <video ref={videoRef} autoPlay width="100%" height="auto" style={{ maxWidth: '100%' }}></video>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <StyledButton variant="contained" color="primary" onClick={startCamera}>
            Démarrer l'Appareil Photo
          </StyledButton>
        </Grid>
        <Grid item xs={6}>
          <StyledButton variant="contained" color="secondary" onClick={stopCamera}>
            Éteindre l'Appareil Photo
          </StyledButton>
        </Grid>
      </Grid>
      <Grid container spacing={2} style={{ marginTop: '10px' }}>
        <Grid item xs={12}>
          <StyledButton variant="contained" color="primary" onClick={takePhoto}>
            Prendre une Photo
          </StyledButton>
        </Grid>
      </Grid>
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
