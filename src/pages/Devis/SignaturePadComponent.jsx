import React, { useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { Button } from '@mui/material';
import './SignaturePadComponent.css';

const SignaturePadComponent = ({ setSignature }) => {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = 400; // Ajustez cette hauteur selon vos besoins

      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = '#fff'; // Assurez-vous que le fond est blanc
        context.fillRect(0, 0, canvas.width, canvas.height);

        signaturePadRef.current = new SignaturePad(canvas, {
          penColor: 'black',
        });
      }
    }
  }, []);

  const clear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const save = () => {
    if (signaturePadRef.current) {
      setSignature(signaturePadRef.current.toDataURL('image/png'));
      alert('Signature enregistrée avec succès !');
    }
  };

  return (
    <div>
      <div className="signature-container">
        <canvas ref={canvasRef} className="sigCanvas"></canvas>
      </div>
      <Button variant="contained" color="primary" onClick={save}>
        Sauvegarder la Signature
      </Button>
      <Button variant="outlined" color="secondary" onClick={clear}>
        Effacer
      </Button>
    </div>
  );
};

export default SignaturePadComponent;
