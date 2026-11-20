export interface StateInfo {
  name: string;
  code: string;
  type: 'State';
  capital: string;
  officialPortal: string;
  schemeCount: number;
}

export const ALL_INDIAN_STATES: StateInfo[] = [
  // 28 Official States of India
  { name: 'Andhra Pradesh', code: 'AP', type: 'State', capital: 'Amaravati', officialPortal: 'https://www.ap.gov.in', schemeCount: 14 },
  { name: 'Arunachal Pradesh', code: 'AR', type: 'State', capital: 'Itanagar', officialPortal: 'https://arunachalpradesh.gov.in', schemeCount: 8 },
  { name: 'Assam', code: 'AS', type: 'State', capital: 'Dispur', officialPortal: 'https://assam.gov.in', schemeCount: 12 },
  { name: 'Bihar', code: 'BR', type: 'State', capital: 'Patna', officialPortal: 'https://state.bihar.gov.in', schemeCount: 15 },
  { name: 'Chhattisgarh', code: 'CG', type: 'State', capital: 'Raipur', officialPortal: 'https://cgstate.gov.in', schemeCount: 11 },
  { name: 'Goa', code: 'GA', type: 'State', capital: 'Panaji', officialPortal: 'https://www.goa.gov.in', schemeCount: 9 },
  { name: 'Gujarat', code: 'GJ', type: 'State', capital: 'Gandhinagar', officialPortal: 'https://gujaratindia.gov.in', schemeCount: 16 },
  { name: 'Haryana', code: 'HR', type: 'State', capital: 'Chandigarh', officialPortal: 'https://haryana.gov.in', schemeCount: 13 },
  { name: 'Himachal Pradesh', code: 'HP', type: 'State', capital: 'Shimla', officialPortal: 'https://himachal.nic.in', schemeCount: 10 },
  { name: 'Jharkhand', code: 'JH', type: 'State', capital: 'Ranchi', officialPortal: 'https://www.jharkhand.gov.in', schemeCount: 11 },
  { name: 'Karnataka', code: 'KA', type: 'State', capital: 'Bengaluru', officialPortal: 'https://karnataka.gov.in', schemeCount: 22 },
  { name: 'Kerala', code: 'KL', type: 'State', capital: 'Thiruvananthapuram', officialPortal: 'https://kerala.gov.in', schemeCount: 17 },
  { name: 'Madhya Pradesh', code: 'MP', type: 'State', capital: 'Bhopal', officialPortal: 'https://mp.gov.in', schemeCount: 18 },
  { name: 'Maharashtra', code: 'MH', type: 'State', capital: 'Mumbai', officialPortal: 'https://www.maharashtra.gov.in', schemeCount: 20 },
  { name: 'Manipur', code: 'MN', type: 'State', capital: 'Imphal', officialPortal: 'https://manipur.gov.in', schemeCount: 7 },
  { name: 'Meghalaya', code: 'ML', type: 'State', capital: 'Shillong', officialPortal: 'https://meghalaya.gov.in', schemeCount: 8 },
  { name: 'Mizoram', code: 'MZ', type: 'State', capital: 'Aizawl', officialPortal: 'https://mizoram.gov.in', schemeCount: 7 },
  { name: 'Nagaland', code: 'NL', type: 'State', capital: 'Kohima', officialPortal: 'https://nagaland.gov.in', schemeCount: 7 },
  { name: 'Odisha', code: 'OR', type: 'State', capital: 'Bhubaneswar', officialPortal: 'https://odisha.gov.in', schemeCount: 16 },
  { name: 'Punjab', code: 'PB', type: 'State', capital: 'Chandigarh', officialPortal: 'https://punjab.gov.in', schemeCount: 12 },
  { name: 'Rajasthan', code: 'RJ', type: 'State', capital: 'Jaipur', officialPortal: 'https://rajasthan.gov.in', schemeCount: 17 },
  { name: 'Sikkim', code: 'SK', type: 'State', capital: 'Gangtok', officialPortal: 'https://sikkim.gov.in', schemeCount: 8 },
  { name: 'Tamil Nadu', code: 'TN', type: 'State', capital: 'Chennai', officialPortal: 'https://www.tn.gov.in', schemeCount: 21 },
  { name: 'Telangana', code: 'TG', type: 'State', capital: 'Hyderabad', officialPortal: 'https://telangana.gov.in', schemeCount: 19 },
  { name: 'Tripura', code: 'TR', type: 'State', capital: 'Agartala', officialPortal: 'https://tripura.gov.in', schemeCount: 8 },
  { name: 'Uttar Pradesh', code: 'UP', type: 'State', capital: 'Lucknow', officialPortal: 'https://up.gov.in', schemeCount: 24 },
  { name: 'Uttarakhand', code: 'UK', type: 'State', capital: 'Dehradun', officialPortal: 'https://uk.gov.in', schemeCount: 11 },
  { name: 'West Bengal', code: 'WB', type: 'State', capital: 'Kolkata', officialPortal: 'https://wb.gov.in', schemeCount: 19 },
  { name: 'Delhi', code: 'DL', type: 'State', capital: 'New Delhi', officialPortal: 'https://delhi.gov.in', schemeCount: 15 }
];
