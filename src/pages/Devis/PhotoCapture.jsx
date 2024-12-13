import React, { useRef, useState } from 'react';

const PhotoCapture = ({ setPhoto }) => {
  const videoRef = useRef(null);
  const [photo, setPhotoLocal] = useState(null);

  const startCamera = (e) => {
    e.preventDefault();
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => console.error("Erreur d'accès à la caméra: ", err));
  };

  const takePhoto = (e) => {
    e.preventDefault();
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const photoData = canvas.toDataURL('image/png');
    setPhotoLocal(photoData);
  };

  const savePhoto = (e) => {
    e.preventDefault();
    if (photo) {
      setPhoto(photo);
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay width="400" height="300"></video>
      <button type="button" onClick={startCamera}>Démarrer la Caméra</button>
      <button type="button" onClick={takePhoto}>Prendre une Photo</button>
      {photo && <img src={photo} alt="Photo capturée" />}
      {photo && <button type="button" onClick={savePhoto}>Sauvegarder la Photo</button>}
    </div>
  );
};

export default PhotoCapture;
