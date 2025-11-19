import React, { useState } from 'react';
import { Form, Input, Checkbox, message } from "antd";
import i18n from "../../locales/i18n";
import { API_URL } from '../../redux/network/api';
import { getProfile } from '../../utils';

const devicesMap = [
  `Heizwert-Gerät € 197`,
  `Brennwert-Gerät* € 262`,
  `Durchlauferhitzer.€ 173`,
  `Gaskonvektor € 153`,
  `BW-wärmepumpe € 350`,
  `Luft-Wärmepumpe € 350`,
];
const Contras = () => {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('Frau')
  const [streetNumber, setStreetNumber] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [title, setTitle] = useState('')
  const [address, setAddress] = useState('')
  const [deviceType, setDeviceType] = useState('')
  const [year, setYear] = useState('')
  const [email, setEmail] = useState('')
  const [tester, setTester] = useState('')
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [serviceType, setServiceType] = useState<string[]>([]);

  const [ss, setSs] = useState('')
  const handleChangeName = (e: any) => {
    setName(e.target.value)
  }
  const handleChangeStreetNumber = (e: any) => {
    setStreetNumber(e.target.value)
  }
  const handleChangeEmail = (e: any) => {
    setEmail(e.target.value)
  }
  const handleChangePostalCode = (e: any) => {
    setPostalCode(e.target.value)
  }
  const handleChangeMobileNumber = (e: any) => {
    setMobileNumber(e.target.value)
  }
  const handleChangeTitle = (e: any) => {
    setTitle(e.target.value)
  }
  const handleChangeAddress = (e: any) => {
    setAddress(e.target.value)
  }
  const handleChangeDeviceType = (e: any) => {
    setDeviceType(e.target.value)
  }
  const handleChangeYear = (e: any) => {
    setYear(e.target.value)
  }
  const handleChangeTester = (e: any) => {
    setTester(e.target.value)
  }

  const handleCheckboxChange = (c: string) => {
    if (serviceType.includes(c)) {
      const newServiceType = serviceType.filter(st => st !== c);
      setServiceType(newServiceType);
    } else {
      setServiceType([...serviceType, c]);
    }
  };


  const sendData = async () => {
    try {
      setBtnDisabled(true)
      for (var i = 0; i < serviceType.length; i++) {
        setSs(ss + serviceType[i] + '   ' + (i > 3 ? '\n' : ''))
      }
      await fetch(`${API_URL}/mailer/send_with_contra`, {
        method: 'POST',
        body: JSON.stringify({
          name: name,
          street_number: streetNumber,
          postal_code: postalCode,
          mobile_number: mobileNumber,
          title: title,
          address: address,
          device_type: deviceType,
          year: year,
          email: email,
          gender: gender,
          selected_devices: serviceType.map((st, i) => st + ' ').toString(),
        }),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      }).then(res => res.json()).then(data => {
        if (data?.status === "success") {
          message.success('Email sent successfully!')
          setName('')
          setStreetNumber('')
          setPostalCode('')
          setMobileNumber('')
          setTitle('')
          setAddress('')
          setDeviceType('')
          setYear('')
          setEmail('')
          setGender('')
          setTester('')
          setServiceType([])
        }else {
          message.error('Failed to send email')
        }
      })

      setBtnDisabled(false)
    } catch (error) {
      throw (error)
    }
  }
  return (
    <form
      onSubmit={
        async (e) => {
          e.preventDefault()
          await sendData()
        }
      }
      className='lg:grid flex flex-col grid-cols-1 lg:grid-cols-2 gap-8'>
      {/** col1  */}
      <div className="container mx-auto border-[1px] border-solid">
        <div>
          <div className='grid grid-cols-2 gap-5 mb-2 px-2'>
            <div className="flex  border  border-[#00000067] p-4">
              <label className="inline-flex items-center">
                <Input required
                  name="gender"
                  type="radio"
                  onChange={(e) => {
                    const { checked } = e.target
                    if (checked) {
                      setGender('Frau')
                    }
                  }} value="female" className="form-checkbox h-5 w-5 text-gray-600" />
                <span className="ml-2">Frau</span>
              </label>
              <label className="inline-flex items-center ml-6">
                <Input required name="gender" onChange={(e) => {
                  const { checked } = e.target
                  if (checked) {
                    setGender('Herr')
                  }
                }} type="radio" value="male" className="form-checkbox h-5 w-5 text-gray-600" />
                <span className="ml-2">Herr</span>
              </label>

            </div>
            <div className="pt-2 border border-[#00000067] ">
              <Input
                type="text" placeholder={i18n.t('title')}
                value={title}
                onChange={handleChangeTitle}
                className="w-full px-3 py-2  rounded-md" />
            </div>
          </div>

          <div className=" border p-2 border-[#00000067]">
            <Input required type="text"
              value={name}
              onChange={handleChangeName} placeholder={i18n.t('name')}
              className="w-full px-3 py-2  rounded-md" />
          </div>

          <div className="border p-2 border-[#00000067]">
            <Input required type="text" placeholder={i18n.t('address')}
              onChange={handleChangeStreetNumber}
              value={streetNumber} className="w-full px-3 py-2  rounded-md" />
          </div>

          <div className="grid grid-cols-2 gap-5 mb-2 px-2 ">
            <div className='border  border-[#00000067]   '>  <Input required
              onChange={handleChangePostalCode}
              value={postalCode}
              type='text' placeholder={i18n.t('zip_code')}
              className='w-full px-3 py2  p-4 rounded-md' /></div>

            <div className='border  border-[#00000067] '>
              <Input required type='text' placeholder={i18n.t('location')}
                value={address}
                onChange={handleChangeAddress}
                className='w-full  p-4 px-3 py2  rounded-md' />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 mb-2 px-2   ">
            <div className='border  border-[#00000067] '>
              <Input required
                value={mobileNumber}
                onChange={handleChangeMobileNumber}
                type='text' placeholder={i18n.t('telephone')}
                className='w-full px-3 p-4  rounded-md' />
            </div>

            <div className='border  border-[#00000067] '>
              <Input required type='text' placeholder={i18n.t('email')}
                value={email}
                onChange={handleChangeEmail}
                className='w-full px-3 py2 p-4  rounded-md' />
            </div>
          </div>
        </div>
      </div>
      {/** col2 */}
      <div className="">
        <div>
          <div className="flex  h-[40px] items-center justify-center">
            <label htmlFor="" className=' text-left min-w-[200px] font-bold'>
              Wunsch-Monteur:
            </label>
            <Input required
              value={tester}
              onChange={handleChangeTester}
              className="w-full px-3 py-2  bg-gray-200"/>
          </div>
          <div className=" w-full flex  h-[30px]">
            <h1 className='font-bold '>       Geräte</h1>
          </div>


          <div className='container mt-[44px] mx-auto border-[1px] border-solid border-[#00000000067]'>
            <div className="grid grid-cols-6 justify-center items-center">
              <div className='col-span-5 border p-4 border-[#00000067]'>
              <label className='font-bold'>Model</label>
                <Input required
                  value={deviceType}
                  onChange={handleChangeDeviceType}
                  type="text" placeholder="Type (Bsp.: VCW AT 194/4-5, HG15, Luna 3 blue, CBG-2-24)"
                  className="w-full px-3 mt-2 rounded-md" />
              </div>
              <div className='border p-4 border-[#00000067]'>
                <label className='font-bold'>Baujahr</label>
                <Input required
                  value={year}
                  onChange={handleChangeYear}
                  type="text" placeholder="Year"
                  className="w-full px-3 mt-2 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='col-span-2 grid grid-cols-3  gap-y-0 gap-5'>
        {devicesMap.map(c => (
          <Form.Item key={c} valuePropName="checked">
            <Checkbox
              onChange={() => handleCheckboxChange(c)}
              checked={serviceType.includes(c)}
            >
              {c}
            </Checkbox>
          </Form.Item>
        ))}
      </div>
      <div className='flex  col-span-2 justify-center items-center w-full'>
        <button disabled={btnDisabled} type="submit" className='px-14 bg-blue-500 text-white rounded-lg py-2'> Submit </button>
      </div>
    </form>
  );
};

export default Contras;
