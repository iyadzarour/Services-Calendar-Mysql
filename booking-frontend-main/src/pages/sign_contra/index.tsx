import React, { useRef } from 'react';
import { Button, message } from "antd";
import SignatureCanvas from 'react-signature-canvas';
import { useSearchParams } from 'react-router-dom';
import { API_URL } from '../../redux/network/api';
import { generatePassword } from '../../utils';

const SignContra: React.FC = () => {
  const sigPadRef = useRef<SignatureCanvas | null>(null);
  const [searchParams] = useSearchParams();

  const emailQuery = searchParams.get('email');
  const first_name = searchParams.get('first_name');
  const last_name = searchParams.get('last_name');
  const phone_number = searchParams.get('phone_number');
  const zip_code = searchParams.get('zip_code');
  const location = searchParams.get('location');
  const address = searchParams.get('address');
  const gender = searchParams.get('gender');

  const handleClear = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
    }
  };

  const handleGenerate = async () => {
    if (sigPadRef.current) {
      const signUrl = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
      await fetch(`${API_URL}/user/sign`, {
        method: 'POST',
        body: JSON.stringify({
          sign_url: signUrl,
          email: emailQuery,
          last_name: last_name,
          first_name: first_name,
          password: generatePassword(),
          location: location,
          address: address,
          zip_code: zip_code ?? '',
          gender: gender,
          phone_number: phone_number,
        }),
        headers: { "Content-Type": "application/json" },
      });

      message.success('Operation done successfully');
      window.location.href = '/';
    }
  };

  return (
    <div className='container'>
      <div style={{
        border: '2px solid black',
        width: 500,
        height: 200
      }}>
        <SignatureCanvas
          penColor='black'
          ref={sigPadRef}
          canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
        />
        <div className='btns-container'>
          <Button className='clear-btn mx-5' onClick={handleClear}>Clear</Button>
          <Button type="primary" className='save-btn' onClick={handleGenerate}>Save</Button>
        </div>
      </div>
    </div>
  );
};

export default SignContra;
