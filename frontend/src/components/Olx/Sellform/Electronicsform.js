// ElectronicsForm.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ImageList,
  ImageListItem,
  IconButton,
} from '@mui/material';

import { AddPhotoAlternate, Camera, Delete } from '@mui/icons-material';
import Webcam from "react-webcam";
import Webcamera from './Webcam';


import { collection, addDoc, doc, setDoc ,serverTimestamp} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { imgDB } from '../../../config/firebase';
import { v4 } from "uuid";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useNavigate } from 'react-router-dom';
import { deleteObject } from "firebase/storage";
import fetchPincodeCity from './Pincode';


const ElectronicsForm = ({ flag, editdata }) => {
  const [imagesArray, setImagesArray] = useState([]);
  const [imageflag, setimageflag] = useState('close');
  const [urls, setUrls] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [pincode,setpincode]=useState('')

  const [formData, setFormData] = useState({
    category: 'Electronics',
    electronicsType: '',
    model: '',
    price: '',
    specifications: '',
    purchaseDate: '',
    additionalDescription: '',
    postedDate: new Date().toLocaleDateString('en-GB'),
    address: '',
    images: [],
    useremail: localStorage.getItem('user_email'),
    status: 'active',
    city:'',
    timestamp: serverTimestamp()
  });

  useEffect(() => {
    if (flag == 'edit' && editdata) { setFormData(editdata); setImagesArray(editdata.images) }
  }, [flag]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleDeleteimage = async (index) => {
  
    const imageUrl = imagesArray[index];
    const imageRef = ref(imgDB, imageUrl);
    try {
      await deleteObject(imageRef);
      setImagesArray((prevImages) => {
        const newImagesArray = [...prevImages];
        newImagesArray.splice(index, 1);
        return newImagesArray;
      });

      // Update Firestore document with new images array
      const updatedImages = imagesArray.filter((_, i) => i !== index);
      const resellDocRef = doc(db, 'resellDoc', formData.id);
      console.log(imagesArray);
      formData.images = updatedImages;
      await setDoc(resellDocRef, { ...formData, images: updatedImages });

    } catch (error) {
      console.error("Error deleting image or updating document:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle the form submission logic her
    if (flag == 'save') {
      try {
        const promises = imagesArray.map(async (image) => {
          const imgRef = ref(imgDB, `Imgs/${v4()}`);
          const imageData = await fetch(image).then((res) => res.blob());
          await uploadBytes(imgRef, imageData);
          const downloadURL = await getDownloadURL(imgRef);
          console.log("Download URL:", downloadURL);
          return downloadURL;
        });

        const downloadURLs = await Promise.all(promises);
        console.log("All URLs:", downloadURLs);
        formData.images = downloadURLs;
      } catch (error) {
        console.error("Error uploading images:", error);
      }


      const uid = localStorage.getItem('uid');
      try {
        const resellDocRef = await addDoc(collection(db, "resellDoc"), formData);

        console.log('Document written with ID: ', uid);
      } catch (error) {
        console.error('Error adding/updating document: ', error);
      }

      navigate("/myads")
    }
    else {
      const resellDocRef = doc(db, 'resellDoc', formData.id);
      await setDoc(resellDocRef, formData);

      navigate("/myads")
    }
    console.log(formData);
  };

  useEffect(()=>{
    const updateCity = async () => {
      const city = await fetchPincodeCity(pincode);
      setFormData((prevData) => ({
        ...prevData,
        city,
      }));
    }
    if(pincode.length>=6){
      updateCity();
  }
  },[pincode]);
  return (
    <Container maxWidth="sm">

      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="electronics-type-label">Electronics Type</InputLabel>
          <Select
            labelId="electronics-type-label"
            name="electronicsType"
            value={formData.electronicsType}
            onChange={handleChange}
          >
            <MenuItem value="TV">TV</MenuItem>
            <MenuItem value="kitchenAppliances">Kitchen Appliances</MenuItem>
            <MenuItem value="computerLaptops">Computer & Laptops</MenuItem>
            <MenuItem value="fridge">Fridge</MenuItem>
            <MenuItem value="AC">AC</MenuItem>
            <MenuItem value="washingMachine">Washing Machine</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Model" fullWidth margin="normal" name="model" value={formData.model} onChange={handleChange} />
        <TextField label="Price" fullWidth margin="normal" name="price" value={formData.price} onChange={handleChange} />
        <TextField
          label="Month & Year of Purchase"
          fullWidth
          margin="normal"
          name="purchaseDate"
          value={formData.purchaseDate}
          onChange={handleChange}
        />
        <TextField
          label="Specifications"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          name="specifications"
          value={formData.specifications}
          onChange={handleChange}
        />

        <TextField
          label="Additional Description"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          name="additionalDescription"
          value={formData.additionalDescription}
          onChange={handleChange}
        />
        <TextField label="Address" fullWidth margin="normal" name="address" value={formData.address} onChange={handleChange} />
        
        <Box sx={{width:'100%',display:'flex',margin:'1vh 0'}}>
        <TextField
          label="Pincode"
          sx={{width:'50%'}}
          margin="normal"
          name="pincode"
          value={pincode}
          onChange={(e)=>setpincode(e.target.value)}
        />
        <TextField
          label="City"
          sx={{width:'50%'}}
          margin="normal"
          name="city"
          value={formData.city}
          onChange={handleChange}
          aria-readonly
        />
        </Box>
     

        <Box sx={{ border: '1px solid black' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            <Button sx={{ display: 'flex', alignItems: 'center' }} onClick={() => setimageflag('select')}> <AddPhotoAlternate />Add photo</Button>
            <Button sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }} onClick={() => setimageflag('click')}><Camera />Click a photo</Button>
          </Box>


          <Webcamera imageflag={imageflag} imagesArray={imagesArray} setImagesArray={setImagesArray} setimageflag={setimageflag} />

          <Box>
            <ImageList sx={{ width: '100%' }} cols={2} rowHeight={180}>
              {imagesArray.map((image, index) => (
                <ImageListItem sx={{ margin: '1px', border: '0.2px solid black' }} key={index}>
                  <img src={image} alt={'image'} loading="lazy" style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                  <IconButton sx={{ position: 'absolute', top: 0, right: 0, borderRadius: '20px', color: 'white', backgroundColor: 'red' }} onClick={() => handleDeleteimage(index)}>
                    <Delete fontSize="small" />
                  </IconButton>

                </ImageListItem>
              ))}
            </ImageList>
          </Box>
        </Box>


        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary" sx={{ width: '100%', fontWeight: 'bold' }}>
            {flag == 'save' ? ('Submit') : ('Update')}
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default ElectronicsForm;
