import axios from "axios";

const fetchPincodeCity = async (pincode) => {
  try {
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
    if (response.data[0].Status === "Success" && response.data[0].PostOffice.length > 0) {
        console.log(response.data[0].PostOffice[0].District)
      return response.data[0].PostOffice[0].District;
    } else {
      return 'Invalid';
    }
  } catch (error) {
    console.error("Error while fetching the city via pincode", error);
    return 'Invalid';
  }
};

export default fetchPincodeCity;
