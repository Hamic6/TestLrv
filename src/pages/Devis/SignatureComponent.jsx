import React, { useRef } from 'react';
import SignaturePad from 'react-signature-canvas';

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
    <div>
      <SignaturePad ref={sigPad} canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }} />
      <button type="button" onClick={clearSignature}>Clear</button>
      <button type="button" onClick={saveSignature}>Save</button>
    </div>
  );
};

export default SignatureComponent;
