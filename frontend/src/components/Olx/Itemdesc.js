import { AppBar, Avatar, Box, Button, Card, Container, Divider, IconButton, Toolbar, Typography ,LinearProgress} from "@mui/material";
import React from "react";
import MenuIcon from '@mui/icons-material/Menu';
import { useEffect,useState } from "react";
import FavoriteIcon from '@mui/icons-material/Favorite';
// import { Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {  useNavigate, useParams } from "react-router-dom";


function Itemdesc(){
  
  const [itemData, setItemData] = useState(null);
  const [desc,setdesc]=useState(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const { id , showcontact } = useParams();
  
  const navigate=useNavigate();
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    window.addEventListener('resize', handleResize);
   
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getCategoryDescription = (allData, category) => {
    if (category) {
      switch (category) {
        case 'Vehicle':
          return { fuelType: allData.fuelType, kmDriven: allData.kmDriven, additionalDescription: allData.additionalDescription };
        case 'Properties':
          return { additionalDescription: allData.additionalDescription, plotArea: allData.plotArea, lengthBreadth: allData.lengthBreadth, floors: allData.floors, rooms: allData.rooms, landmark: allData.landmark };
        case 'Mobiles':
        case 'Electronics':
          return { dateofPurchase:allData.purchaseDate,additionalDescription: allData.additionalDescription, specifications: allData.specifications ,};
        default:
          return {};
      }
    }
    return {};
  };

useEffect(()=>{
    
 if (id) {
  const getItemData = async () => {
    try {
      const resellDocRef = doc(db,'resellDoc',id);
      const resellDoc = await getDoc(resellDocRef);
      
      if (resellDoc.exists()) {
        const resellData = resellDoc.data();
        setItemData(resellData);
        setdesc(getCategoryDescription(resellData,resellData.category))
        console.log('Item Data:', resellData);
      } else {
        console.log('Item document does not exist');
      }
    } catch (error) {
      console.error('Error fetching Item data:', error.message);
    }
  };

  getItemData();
} else {
  console.log('User UID not found in local storage');
}

},[id])

    return (
        <div>
          {
            (itemData=='null' || itemData==null || desc=='null' || desc==null) ?
              (<LinearProgress />):
              (<Box> <Box sx={{ flexGrow: 1 }}>
      
                </Box>
          
                <Box sx={{m:'5vh 0'}}>
                <Swiper
                modules={[Navigation, Pagination]}
                navigation={!isMobile}
                pagination={{ clickable: true }}
                spaceBetween={0}
                slidesPerView={1}
                onSwiper={(swiper) => console.log(swiper)}
                
              >
                {
                  itemData.images.map((ipath)=>(
                    <SwiperSlide><Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' ,border:'none'}}>
                      <img src={ipath} alt="error" style={{ width: 'auto', height: 'auto', objectFit: 'cover', ...((window.innerWidth <= 600) ? { width: '80vw' } : { width: '40vw' }) }} />
                  </Box></SwiperSlide>
                  ))
                }
              </Swiper>
                </Box>
          
                <Box sx={{display:'flex',flexDirection:'column',alignItems:'center'}}>
          
                  <Box sx={{border:'1px solid lightgrey',mt:'4vh', borderRadius:'10px',padding:'3vh 5vw',width:'70vw'}}>
                    <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <Typography sx={{fontWeight:'bold',fontSize:{xs:'24px',sm:"30px"},m:'1vh 0'}}>{itemData.price}</Typography>
                    {/* <FavoriteIcon/>    */}
                    </Box>
                    <Typography sx={{fontSize:{xs:'18px',sm:"20px"}}}>{itemData.category === 'Properties' ? `${itemData.propertyType} for ${itemData.transactionType}` : itemData.model}</Typography>
                    <Divider sx={{backgroundColor:'lightblue',m:'1vh 0'}}/>
                    <Box sx={{display:'flex',flexDirection:{xs:'column',sm:'row'},justifyContent:'space-between'}}>
                    <Typography sx={{fontSize:{xs:'14px',sm:"16px"}}}>{itemData.address}</Typography>
                    <Typography sx={{fontSize:{xs:'14px',sm:"16px"}}}>{itemData.postedDate}</Typography>
                    </Box>
                  </Box>
          
                  <Box sx={{border:'1px solid lightgrey', mt:'4vh',mb:'4vh' , borderRadius:'10px',padding:'2vh 5vw',width:'70vw'}}>
                  <Typography sx={{fontSize:{xs:'16px',sm:"18px"},fontWeight:'bold'}}>Description</Typography>
                  <Divider sx={{backgroundColor:'lightblue',m:'1vh 0'}}/>
                {Object.entries(desc).map(([key, value]) => (
                <div key={key}>
                  <Typography sx={{ fontSize: { xs: '14px', sm: '16px' }, color: 'grey' , fontWeight:'bold' }}>{key}   </Typography>
                  
                  <Typography sx={{ fontSize: { xs: '14px', sm: '16px' } }}>{value}</Typography>
                  <Divider style={{margin:'10px 0'}}/>
                </div>
              ))}
              
                  </Box>

                    {(showcontact=='1'||showcontact==1)?(<></>):(<Box sx={{border:'1px solid lightgrey', mb:'4vh',borderRadius:'10px',padding:'2vh 5vw',width:'70vw'}}>
                    <Box sx={{display:'flex',alignItems:'center'}}><Avatar /><Typography sx={{fontSize:{xs:'14px',sm:"18px"},fontWeight:'bold',ml:'5vw'}}>{itemData.useremail}</Typography></Box>
                    <Box sx={{display:'flex',alignContent:'center',justifyContent:'center',mt:'3vh'}}>
                      <Button sx={{border:'2px solid black',borderRadius:'5px',width:'80vw',fontWeight:'bold',color:'black'}} onClick={()=>navigate(`/chat/${itemData.useremail}`)}>Chat with seller</Button></Box>
                  </Box>)}
                  
          
                </Box></Box>)
          }
        </div>
    )
}

export default Itemdesc;