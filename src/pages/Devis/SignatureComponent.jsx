import React, { useRef } from 'react';
import SignaturePad from 'react-signature-canvas';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import './SignatureComponent.css';

const StyledButton = styled(Button)`
  margin-top: 20px;
`;

const SignatureComponent = ({ setSignature }) => {
  const sigCanvas = useRef({});

  const clear = () => sigCanvas.current.clear();

  const save = () => {
    setSignature(sigCanvas.current.getTrimmedCanvas().toDataURL('image/png'));
    alert('Signature enregistrée avec succès !');
  };

  return (
    <div>
      <div className="signature-container">
        <SignaturePad
          ref={sigCanvas}
          canvasProps={{ className: 'sigCanvas' }}
        />
      </div>
      <StyledButton variant="contained" color="primary" onClick={save}>
        Sauvegarder la Signature
      </StyledButton>
      <StyledButton variant="outlined" color="secondary" onClick={clear}>
        Effacer
      </StyledButton>
    </div>
  );
};

export default SignatureComponent;
