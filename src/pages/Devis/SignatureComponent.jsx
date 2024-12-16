import React, { useRef } from 'react';
import SignaturePad from 'react-signature-canvas';
import { Button, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const SignatureComponent = ({ setSignature }) => {
  const sigPad = useRef(null);

  const clearSignature = (e) => {
    e.preventDefault();
    sigPad.current.clear();
    setSignature('');
  };

  const saveSignature = (e) => {
    e.preventDefault();
    const signature = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
    setSignature(signature);
  };

  return (
    <div className="signature-container">
      <SignaturePad ref={sigPad} canvasProps={{ className: 'sigCanvas' }} />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <StyledButton variant="contained" color="primary" onClick={clearSignature}>
            Effacer
          </StyledButton>
        </Grid>
        <Grid item xs={6}>
          <StyledButton variant="contained" color="primary" onClick={saveSignature}>
            Sauvegarder
          </StyledButton>
        </Grid>
      </Grid>
    </div>
  );
};

export default SignatureComponent;
