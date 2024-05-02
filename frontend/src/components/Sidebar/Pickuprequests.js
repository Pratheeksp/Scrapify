import { Download } from "@mui/icons-material";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import React, { useState , useEffect, useRef } from "react";
import { collection } from "firebase/firestore";
import { db } from "../../config/firebase";
import { getDocs,query } from "firebase/firestore";

function Pickuprequests(){

    const [pickups, setPickups] = useState([]);
    const [isDataFetched, setIsDataFetched] = useState(false);
    // const isFirstRun = useRef(true);

    useEffect(() => {
        const fetchPickups = async () => {
            try {
                const pickupsCollectionRef = collection(db, "pickupDoc");
                const querySnapshot = await getDocs(query(pickupsCollectionRef));
    
                const uid = localStorage.getItem('uid');
                const user_email=localStorage.getItem('user_email');
                console.log(user_email,uid)

                const pickupData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).filter(pickup => pickup.email === user_email);
    
                const notPickedPickups = pickupData.filter(pickup => pickup.picked === false);
    
                console.log("Pickups not picked:", notPickedPickups);
                setPickups(notPickedPickups);
                // if (!isFirstRun.current) {
                    if(!isDataFetched){
                    const pickedPickups = pickupData.filter(pickup => pickup.picked === true);
                    if (pickedPickups.length > 0) {
                        
                        const paymentCollectionRef = collection(db, "payment");
                        const paymentQuerySnapshot = await getDocs(query(paymentCollectionRef));
                        const paymentData = paymentQuerySnapshot.docs
                            .map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            }))
                            .filter(payment => payment.userId === uid);
                        console.log("Picked pickups payment info :", paymentData);
                        
                        setPickups(prevPickups => [...prevPickups, ...paymentData]);
                    
                    }
                }
                setIsDataFetched(true)
                // isFirstRun.current = false;
            } catch (error) {
                console.error("Error fetching pickups and payment data:", error);
            }
        };
        console.log("Overall pickups:",pickups)
        fetchPickups();
    }, []);
      

    function Bill({pick}){
       return(
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "0.5px solid grey" }}>
            <th style={{ padding: "8px", color: "grey" }}>Item</th>
            <th style={{ padding: "8px", color: "grey" }}>qty</th>
            <th style={{ padding: "8px", color: "grey" }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {pick.material_info.map((item, index) => (
            <tr key={index}>
              <td style={{ textAlign: "center", padding: "10px" }}>{item.subcat}</td>
              <td style={{ textAlign: "center", padding: "10px" }}>{item.quantity}</td>
              <td style={{ textAlign: "center", padding: "10px" }}>{item.tprice}</td>
            </tr>
          ))}
          <tr style={{ borderTop: "1px dotted grey", margin: "10px 0" }}>
            <td style={{ textAlign: "center", padding: "10px", fontWeight: "bold", color: "grey" }}>Total</td>
            <td></td>
            <td style={{ textAlign: "center", padding: "10px", fontWeight: "bolder" ,color:'rgb(11, 225, 44)' }}>&#x20B9;{pick.amount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
       )
    }

    const [showBillComponents, setShowBillComponents] = useState(Array(pickups.length).fill(false));

    const toggleBillComponent = (index) => {
        const newShowBillComponents = [...showBillComponents];
        newShowBillComponents[index] = !newShowBillComponents[index];
        setShowBillComponents(newShowBillComponents);
      };

    return(
        <>
        <Box>
            
            {
                (pickups.length!=0) ? (<>
                <Box sx={{margin:'5vh',display:'flex',flexDirection:'column',alignItems:'center'}}>
                <Typography fontWeight={'bolder'}>Your pickup requests</Typography>
                {pickups.map((pick,index)=>(
                        <Box sx={{width:'70vw',minheight:{xs:'140px',sm:'160px'},border:'0.8px solid grey',borderRadius:'5px',mt:'4vh',padding:'2vh 5vw',backgroundColor:'rgba(200, 200, 200, 0.07)'
                        }}>

                            <Box display={'flex'} justifyContent={'space-between'} mb={'1vh'} sx={{flexDirection:{xs:'column',sm:'row'}}}>
                            <Typography color={'grey'} fontWeight={'bold'}>{pick.picked !== undefined ? pick.id : pick.pickupId}</Typography>
                                <Typography color={'grey'}>{pick.picked !== undefined ? pick.date : new Date(pick.date.seconds * 1000).toLocaleDateString('en-GB')}</Typography>
                            </Box>
                            
                            {
                                pick.picked !== undefined ? (<Typography color={'red'} fontWeight={'bolder'} fontSize={'20px'}>OTP : &nbsp;{pick.otp}</Typography>):(<Typography color={'rgb(11, 225, 44)'} fontWeight={'bolder'} fontSize={'20px'}>&#8377;&nbsp;{pick.amount}</Typography>)
                            }
                            <Divider sx={{margin:'2vh 0'}}/>
                         
                            
                    {/* <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap' }}>
                        {pick.scrapsSold.map((scrap) => (
                            <li style={{padding:'0 1vw',borderRight:'1px solid rgb(11, 225, 44)'}}>{scrap.item}</li>
                        ))}
                    </ul> */}

                    {
                        pick.picked!=undefined?(<Typography color={'grey'}>Your pickup has not been collected yet.
                            <br />Share the above OTP when the vendor arrives
                        </Typography>):(
                       <>
                        
                        <Button onClick={() => toggleBillComponent(index)} >View Bill</Button>
                        {showBillComponents[index] && <Bill pick={pick}/>}
                        </>
                        
                    )
                    }
                        </Box>
                    ))}
                </Box>
                </>) :(<>
                <Box sx={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',marginTop:'25vh'}}>
                    <Typography width={'60vw'}>You have not raised any request till now</Typography>
                    <Button sx={{textTransform:'none',color:'white',fontWeight:'bolder',backgroundColor:'rgb(11, 225, 44)',padding:'10px',margin:'5vh 0'}}>Raise pickup request</Button>
                </Box>
                </>)
}
        </Box>
       
        </>
    )
}

export default Pickuprequests;