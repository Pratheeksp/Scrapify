
import React from "react";
import { useState,useEffect } from "react";
import { collection } from "firebase/firestore";
import { db } from "../../config/firebase";
import { getDocs,updateDoc,doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Box , Button, LinearProgress, Typography} from "@mui/material";


function Myads(){
    const [itemData, setItemData] = useState([]);
    const userEmail = localStorage.getItem("user_email");    
    useEffect(() => {
        const fetchItemData = async (userEmail) => {
            const itemsCollection = collection(db, 'resellDoc');
          
            try {
              const querySnapshot = await getDocs(itemsCollection);
          
              const itemDataArray = [];
              
              querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.useremail === userEmail) {
                  itemDataArray.push({
                    id: doc.id,
                    ...data
                  });
                }
              });    
              setItemData(itemDataArray);
            } catch (error) {
              console.error('Error fetching item data:', error);
              return [];
            }
          };
        ////////////////////
        fetchItemData(userEmail);
      }, [userEmail]);

      useEffect(() => {
        console.log('Item Data Array:', itemData);
      }, [itemData]);

      const handleSoldStatus = async (id) => {
        console.log(id);
        const confirmUpdate = window.confirm("Do you really want to update the status to 'sold'?");
  
        if (confirmUpdate) {
        try {

          const itemRef = doc(db, 'resellDoc', id);
          await updateDoc(itemRef, { status: 'sold' });
          setItemData(prevData => prevData.map(item => item.id === id ? { ...item, status: 'sold' } : item));
        } catch (error) {
          console.error('Error updating sold status:', error);
        }
      }
      };
    
    


      const navigate=useNavigate();
    return(
      <Box>
        {
          (itemData=='null' || itemData==null)?(<LinearProgress />):(
            <Box>
      {
          itemData.map((data)=>(
              <Box sx={{display:'flex',width:'90vw',minheight:{xs:'140px',sm:'160px'},border:'0.8px solid grey',margin:'3vh auto'}}>
                  
              <Box sx={{ width: '40%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img
                  src={data.images[0]}
                  style={{ width: '80%', height: '80%'}}
                  alt="Centered Image"
              />
              </Box>
                  <Box sx={{width:'60%',display:'flex',flexDirection:'column'}}>
                      
                      <Typography sx={{ backgroundColor:'rgba(173, 216, 230, 0.2)',flex:1,display: 'flex', alignItems: 'center',paddingLeft:'3vw',fontSize:{xs:'14px',sm:'18px'}}}>{data.category === 'Properties' ? `${data.propertyType} for ${data.transactionType}` : data.model}</Typography>
                      <Typography sx={{ display: 'flex', alignItems: 'center',backgroundColor:'rgba(211, 211, 211, 0.2)',flex:1,paddingLeft:'3vw',fontSize:{xs:'14px',sm:'18px'},fontWeight:'bold'}}>&#8377; &nbsp; {data.price}</Typography>
                          <Box sx={{flex:1,display:'flex',justifyContent:'space-around'}}>
                          <Button sx={{color:'green',fontWeight:'bold'}} onClick={()=>navigate(`/editform`,{state:{formData:data}})} disabled={data.status=='sold'?true:false}>Edit</Button>
                          <Button sx={{color:'blue',fontWeight:'bold'}} onClick={()=>navigate(`/resell/${data.id}/1`)}>View</Button> </Box> 
                      {
                        (data.status=="active") ? (<Button sx={{flex:0.5,width:'80%',height:'60%',border:'1px solid black',borderRadius:'2px',fontWeight:'bolder',color:'black',margin:'0 auto 5% auto'}} onClick={()=>handleSoldStatus(data.id)}>Mark as sold</Button> ) : (
                          <Button sx={{flex:0.5,width:'80%',height:'60%',border:'1px solid black',borderRadius:'2px',fontWeight:'bolder',color:'black',margin:'0 auto 5% auto'}}disabled>Sold</Button> 
                        )
                      }
                  </Box>
              </Box>
          ))
      }
      </Box>
          )
        }
      </Box>
    )
}

export default Myads;