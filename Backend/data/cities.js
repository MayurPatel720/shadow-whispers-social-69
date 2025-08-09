const INDIAN_CITIES = [
	// Metro Cities
	{
		id: "mumbai",
		name: "Mumbai",
		state: "Maharashtra",
		isCapital: false,
		isMetro: true,
		population: 12442373,
		aliases: ["Bombay"],
	},
	{
		id: "delhi",
		name: "Delhi",
		state: "Delhi",
		isCapital: true,
		isMetro: true,
		population: 11007835,
	},
	{
		id: "bengaluru",
		name: "Bengaluru",
		state: "Karnataka",
		isCapital: true,
		isMetro: true,
		population: 8443675,
		aliases: ["Bangalore"],
	},
	{
		id: "hyderabad",
		name: "Hyderabad",
		state: "Telangana",
		isCapital: true,
		isMetro: true,
		population: 6809970,
	},
	{
		id: "ahmedabad",
		name: "Ahmedabad",
		state: "Gujarat",
		isCapital: false,
		isMetro: true,
		population: 5570585,
	},
	{
		id: "chennai",
		name: "Chennai",
		state: "Tamil Nadu",
		isCapital: true,
		isMetro: true,
		population: 4681087,
		aliases: ["Madras"],
	},
	{
		id: "kolkata",
		name: "Kolkata",
		state: "West Bengal",
		isCapital: true,
		isMetro: true,
		population: 4496694,
		aliases: ["Calcutta"],
	},
	{
		id: "pune",
		name: "Pune",
		state: "Maharashtra",
		isCapital: false,
		isMetro: true,
		population: 3124458,
	},
	// Additional Tier‑II cities
	{
		id: "jaipur",
		name: "Jaipur",
		state: "Rajasthan",
		isCapital: true,
		isMetro: false,
		population: 4207000,
	},
	{
		id: "lucknow",
		name: "Lucknow",
		state: "Uttar Pradesh",
		isCapital: true,
		isMetro: false,
		population: 3945000,
	},
	{
		id: "surat",
		name: "Surat",
		state: "Gujarat",
		isCapital: false,
		isMetro: false,
		population: 8065000,
	},
	{
		id: "indore",
		name: "Indore",
		state: "Madhya Pradesh",
		isCapital: false,
		isMetro: false,
		population: 2565000,
	},
	{
		id: "bhubaneswar",
		name: "Bhubaneswar",
		state: "Odisha",
		isCapital: true,
		isMetro: false,
		population: 1258000,
	},
	{
		id: "patna",
		name: "Patna",
		state: "Bihar",
		isCapital: true,
		isMetro: false,
		population: 2580000,
	},
	{
		id: "nagpur",
		name: "Nagpur",
		state: "Maharashtra",
		isCapital: false,
		isMetro: false,
		population: 3047000,
	},
	{
		id: "coimbatore",
		name: "Coimbatore",
		state: "Tamil Nadu",
		isCapital: false,
		isMetro: false,
		population: 1061447,
	},
	{
		id: "kochi",
		name: "Kochi",
		state: "Kerala",
		isCapital: false,
		isMetro: false,
		population: 829000,
	},
	{
		id: "mysuru",
		name: "Mysuru",
		state: "Karnataka",
		isCapital: false,
		isMetro: false,
		population: 1288000,
	},
	{
		id: "ghaziabad",
		name: "Ghaziabad",
		state: "Uttar Pradesh",
		isCapital: false,
		isMetro: false,
		population: 2273000,
	},
	{
		id: "faridabad",
		name: "Faridabad",
		state: "Haryana",
		isCapital: false,
		isMetro: false,
		population: 1949000,
	},
	// Additional Tier‑I cities
	{
		id: "ahmedabad",
		name: "Ahmedabad",
		state: "Gujarat",
		isCapital: false,
		isMetro: true,
		population: 8650605,
	},
	{
		id: "pune",
		name: "Pune",
		state: "Maharashtra",
		isCapital: false,
		isMetro: true,
		population: 13000000,
	}, // updated 2024 est.

	// Andhra Pradesh
	{
		id: "amaravati",
		name: "Amaravati",
		state: "Andhra Pradesh",
		isCapital: true,
		isMetro: false,
	},
	{
		id: "visakhapatnam",
		name: "Visakhapatnam",
		state: "Andhra Pradesh",
		isCapital: false,
		isMetro: false,
		population: 1730320,
	},
	{
		id: "vijayawada",
		name: "Vijayawada",
		state: "Andhra Pradesh",
		isCapital: false,
		isMetro: false,
		population: 1048240,
	},
	{
		id: "guntur",
		name: "Guntur",
		state: "Andhra Pradesh",
		isCapital: false,
		isMetro: false,
	},
	{
		id: "tirupati",
		name: "Tirupati",
		state: "Andhra Pradesh",
		isCapital: false,
		isMetro: false,
	},

	// Arunachal Pradesh
	{
		id: "itanagar",
		name: "Itanagar",
		state: "Arunachal Pradesh",
		isCapital: true,
		isMetro: false,
	},

	// Assam
	{
		id: "guwahati",
		name: "Guwahati",
		state: "Assam",
		isCapital: false,
		isMetro: false,
		population: 957352,
	},
	{
		id: "dispur",
		name: "Dispur",
		state: "Assam",
		isCapital: true,
		isMetro: false,
	},
	{
		id: "dibrugarh",
		name: "Dibrugarh",
		state: "Assam",
		isCapital: false,
		isMetro: false,
	},

	// Bihar
	{
		id: "patna",
		name: "Patna",
		state: "Bihar",
		isCapital: true,
		isMetro: false,
		population: 1684222,
	},
	{
		id: "gaya",
		name: "Gaya",
		state: "Bihar",
		isCapital: false,
		isMetro: false,
	},
	{
		id: "bhagalpur",
		name: "Bhagalpur",
		state: "Bihar",
		isCapital: false,
		isMetro: false,
	},

	// Chhattisgarh
	{
		id: "raipur",
		name: "Raipur",
		state: "Chhattisgarh",
		isCapital: true,
		isMetro: false,
		population: 1010087,
	},
	{
		id: "bilaspur_cg",
		name: "Bilaspur",
		state: "Chhattisgarh",
		isCapital: false,
		isMetro: false,
	},

	// Goa
	{
		id: "panaji",
		name: "Panaji",
		state: "Goa",
		isCapital: true,
		isMetro: false,
	},
	{
		id: "margao",
		name: "Margao",
		state: "Goa",
		isCapital: false,
		isMetro: false,
	},

	// Gujarat
	{
		id: "gandhinagar",
		name: "Gandhinagar",
		state: "Gujarat",
		isCapital: true,
		isMetro: false,
	},
	{
		id: "surat",
		name: "Surat",
		state: "Gujarat",
		isCapital: false,
		isMetro: false,
		population: 4467797,
	},
	{
		id: "vadodara",
		name: "Vadodara",
		state: "Gujarat",
		isCapital: false,
		isMetro: false,
		population: 1666703,
		aliases: ["Baroda"],
	},
	{
		id: "rajkot",
		name: "Rajkot",
		state: "Gujarat",
		isCapital: false,
		isMetro: false,
		population: 1286995,
	},
	{
		id: "anand",
		name: "Anand",
		state: "Gujarat",
		isCapital: false,
		isMetro: false,
	},
	{
		id: "mehsana",
		name: "Mehsana",
		state: "Gujarat",
		isCapital: false,
		isMetro: false,
	},
	{
		id: "bhavnagar",
		name: "Bhavnagar",
		state: "Gujarat",
		isCapital: false,
		isMetro: false,
	},
	{
		id: "jamnagar",
		name: "Jamnagar",
		state: "Gujarat",
		isCapital: false,
		isMetro: false,
	},
	{
		id: "junagadh",
		name: "Junagadh",
		state: "Gujarat",
		isCapital: false,
		isMetro: false,
	},

	// Haryana
	{
		id: "chandigarh",
		name: "Chandigarh",
		state: "Haryana",
		isCapital: true,
		isMetro: false,
		population: 1055450,
	},
	{
		id: "gurgaon",
		name: "Gurgaon",
		state: "Haryana",
		isCapital: false,
		isMetro: false,
		population: 876824,
		aliases: ["Gurugram"],
	},
	{
		id: "faridabad",
		name: "Faridabad",
		state: "Haryana",
		isCapital: false,
		isMetro: false,
		population: 1414050,
	},

	// Himachal Pradesh
	{
		id: "shimla",
		name: "Shimla",
		state: "Himachal Pradesh",
		isCapital: true,
		isMetro: false,
	},
	{
		id: "manali",
		name: "Manali",
		state: "Himachal Pradesh",
		isCapital: false,
		isMetro: false,
	},

	// Jharkhand
	{
		id: "ranchi",
		name: "Ranchi",
		state: "Jharkhand",
		isCapital: true,
		isMetro: false,
		population: 1073440,
	},
	{
		id: "jamshedpur",
		name: "Jamshedpur",
		state: "Jharkhand",
		isCapital: false,
		isMetro: false,
		population: 629659,
	},

	// Karnataka
	{
		id: "mysuru",
		name: "Mysuru",
		state: "Karnataka",
		isCapital: false,
		isMetro: false,
		population: 887446,
		aliases: ["Mysore"],
	},
	{
		id: "mangaluru",
		name: "Mangaluru",
		state: "Karnataka",
		isCapital: false,
		isMetro: false,
		aliases: ["Mangalore"],
	},
	{
		id: "hubli",
		name: "Hubli",
		state: "Karnataka",
		isCapital: false,
		isMetro: false,
	},

	// Kerala
	{
		id: "thiruvananthapuram",
		name: "Thiruvananthapuram",
		state: "Kerala",
		isCapital: true,
		isMetro: false,
		population: 957730,
	},
	{
		id: "kochi",
		name: "Kochi",
		state: "Kerala",
		isCapital: false,
		isMetro: false,
		population: 677381,
		aliases: ["Cochin"],
	},
	{
		id: "kozhikode",
		name: "Kozhikode",
		state: "Kerala",
		isCapital: false,
		isMetro: false,
		aliases: ["Calicut"],
	},
	{
		id: "kottayam",
		name: "Kottayam",
		state: "Kerala",
		isCapital: false,
		isMetro: false,
	},

	// Madhya Pradesh
	{
		id: "bhopal",
		name: "Bhopal",
		state: "Madhya Pradesh",
		isCapital: true,
		isMetro: false,
		population: 1798218,
	},
	{
		id: "indore",
		name: "Indore",
		state: "Madhya Pradesh",
		isCapital: false,
		isMetro: false,
		population: 1964086,
	},
	{
		id: "gwalior",
		name: "Gwalior",
		state: "Madhya Pradesh",
		isCapital: false,
		isMetro: false,
	},

	// Maharashtra
	{
		id: "nagpur",
		name: "Nagpur",
		state: "Maharashtra",
		isCapital: false,
		isMetro: false,
		population: 2405421,
	},
	{
		id: "nashik",
		name: "Nashik",
		state: "Maharashtra",
		isCapital: false,
		isMetro: false,
		population: 1486973,
	},
	{
		id: "aurangabad",
		name: "Aurangabad",
		state: "Maharashtra",
		isCapital: false,
		isMetro: false,
		population: 1175116,
	},
	{
		id: "solapur",
		name: "Solapur",
		state: "Maharashtra",
		isCapital: false,
		isMetro: false,
	},

	// Manipur
	{
		id: "imphal",
		name: "Imphal",
		state: "Manipur",
		isCapital: true,
		isMetro: false,
	},

	// Meghalaya
	{
		id: "shillong",
		name: "Shillong",
		state: "Meghalaya",
		isCapital: true,
		isMetro: false,
	},

	// Mizoram
	{
		id: "aizawl",
		name: "Aizawl",
		state: "Mizoram",
		isCapital: true,
		isMetro: false,
	},

	// Nagaland
	{
		id: "kohima",
		name: "Kohima",
		state: "Nagaland",
		isCapital: true,
		isMetro: false,
	},

	// Odisha
	{
		id: "bhubaneswar",
		name: "Bhubaneswar",
		state: "Odisha",
		isCapital: true,
		isMetro: false,
		population: 837737,
	},
	{
		id: "cuttack",
		name: "Cuttack",
		state: "Odisha",
		isCapital: false,
		isMetro: false,
	},

	// Punjab
	{
		id: "amritsar",
		name: "Amritsar",
		state: "Punjab",
		isCapital: false,
		isMetro: false,
		population: 1132761,
	},
	{
		id: "ludhiana",
		name: "Ludhiana",
		state: "Punjab",
		isCapital: false,
		isMetro: false,
		population: 1618879,
	},
	{
		id: "jalandhar",
		name: "Jalandhar",
		state: "Punjab",
		isCapital: false,
		isMetro: false,
	},

	// Rajasthan
	{
		id: "jaipur",
		name: "Jaipur",
		state: "Rajasthan",
		isCapital: true,
		isMetro: false,
		population: 3046163,
	},
	{
		id: "jodhpur",
		name: "Jodhpur",
		state: "Rajasthan",
		isCapital: false,
		isMetro: false,
		population: 1033756,
	},
	{
		id: "udaipur",
		name: "Udaipur",
		state: "Rajasthan",
		isCapital: false,
		isMetro: false,
	},
	{
		id: "kota",
		name: "Kota",
		state: "Rajasthan",
		isCapital: false,
		isMetro: false,
	},

	// Sikkim
	{
		id: "gangtok",
		name: "Gangtok",
		state: "Sikkim",
		isCapital: true,
		isMetro: false,
	},

	// Tamil Nadu
	{
		id: "coimbatore",
		name: "Coimbatore",
		state: "Tamil Nadu",
		isCapital: false,
		isMetro: false,
		population: 1061447,
	},
	{
		id: "madurai",
		name: "Madurai",
		state: "Tamil Nadu",
		isCapital: false,
		isMetro: false,
		population: 1561129,
	},
	{
		id: "tiruchirappalli",
		name: "Tiruchirappalli",
		state: "Tamil Nadu",
		isCapital: false,
		isMetro: false,
		aliases: ["Trichy"],
	},
	{
		id: "salem",
		name: "Salem",
		state: "Tamil Nadu",
		isCapital: false,
		isMetro: false,
	},

	// Tripura
	{
		id: "agartala",
		name: "Agartala",
		state: "Tripura",
		isCapital: true,
		isMetro: false,
	},

	// Uttar Pradesh
	{
		id: "lucknow",
		name: "Lucknow",
		state: "Uttar Pradesh",
		isCapital: true,
		isMetro: false,
		population: 2817105,
	},
	{
		id: "kanpur",
		name: "Kanpur",
		state: "Uttar Pradesh",
		isCapital: false,
		isMetro: false,
		population: 2767031,
	},
	{
		id: "agra",
		name: "Agra",
		state: "Uttar Pradesh",
		isCapital: false,
		isMetro: false,
		population: 1574542,
	},
	{
		id: "varanasi",
		name: "Varanasi",
		state: "Uttar Pradesh",
		isCapital: false,
		isMetro: false,
		population: 1198491,
		aliases: ["Benares"],
	},
	{
		id: "meerut",
		name: "Meerut",
		state: "Uttar Pradesh",
		isCapital: false,
		isMetro: false,
	},
	{
		id: "allahabad",
		name: "Allahabad",
		state: "Uttar Pradesh",
		isCapital: false,
		isMetro: false,
		aliases: ["Prayagraj"],
	},
	{
		id: "noida",
		name: "Noida",
		state: "Uttar Pradesh",
		isCapital: false,
		isMetro: false,
	},
	{
		id: "ghaziabad",
		name: "Ghaziabad",
		state: "Uttar Pradesh",
		isCapital: false,
		isMetro: false,
	},

	// Uttarakhand
	{
		id: "dehradun",
		name: "Dehradun",
		state: "Uttarakhand",
		isCapital: true,
		isMetro: false,
		population: 578420,
	},
	{
		id: "haridwar",
		name: "Haridwar",
		state: "Uttarakhand",
		isCapital: false,
		isMetro: false,
	},

	// West Bengal
	{
		id: "durgapur",
		name: "Durgapur",
		state: "West Bengal",
		isCapital: false,
		isMetro: false,
	},
	{
		id: "siliguri",
		name: "Siliguri",
		state: "West Bengal",
		isCapital: false,
		isMetro: false,
	},

	// Union Territories
	{
		id: "port_blair",
		name: "Port Blair",
		state: "Andaman and Nicobar Islands",
		isCapital: true,
		isMetro: false,
	},
	{
		id: "daman",
		name: "Daman",
		state: "Dadra and Nagar Haveli and Daman and Diu",
		isCapital: true,
		isMetro: false,
	},
	{
		id: "jammu",
		name: "Jammu",
		state: "Jammu and Kashmir",
		isCapital: false,
		isMetro: false,
	},
	{
		id: "srinagar",
		name: "Srinagar",
		state: "Jammu and Kashmir",
		isCapital: true,
		isMetro: false,
	},
	{ id: "leh", name: "Leh", state: "Ladakh", isCapital: true, isMetro: false },
	{
		id: "kavaratti",
		name: "Kavaratti",
		state: "Lakshadweep",
		isCapital: true,
		isMetro: false,
	},
	{
		id: "puducherry",
		name: "Puducherry",
		state: "Puducherry",
		isCapital: true,
		isMetro: false,
		aliases: ["Pondicherry"],
	},
];

const getPopularCities = () => {
	return INDIAN_CITIES.filter(
		(city) =>
			city.isMetro ||
			city.isCapital ||
			(city.population && city.population > 1000000)
	)
		.sort((a, b) => (b.population || 0) - (a.population || 0))
		.slice(0, 20);
};

const getCitiesByState = () => {
	return INDIAN_CITIES.filter((city) => city.state === state);
};

const searchCities = () => {
	const searchTerm = query.toLowerCase();
	return INDIAN_CITIES.filter(
		(city) =>
			city.name.toLowerCase().includes(searchTerm) ||
			city.state.toLowerCase().includes(searchTerm) ||
			(city.aliases &&
				city.aliases.some((alias) => alias.toLowerCase().includes(searchTerm)))
	);
};

export const INDIAN_STATES = [
	"Andhra Pradesh",
	"Arunachal Pradesh",
	"Assam",
	"Bihar",
	"Chhattisgarh",
	"Goa",
	"Gujarat",
	"Haryana",
	"Himachal Pradesh",
	"Jharkhand",
	"Karnataka",
	"Kerala",
	"Madhya Pradesh",
	"Maharashtra",
	"Manipur",
	"Meghalaya",
	"Mizoram",
	"Nagaland",
	"Odisha",
	"Punjab",
	"Rajasthan",
	"Sikkim",
	"Tamil Nadu",
	"Telangana",
	"Tripura",
	"Uttar Pradesh",
	"Uttarakhand",
	"West Bengal",
	"Delhi",
	"Andaman and Nicobar Islands",
	"Dadra and Nagar Haveli and Daman and Diu",
	"Jammu and Kashmir",
	"Ladakh",
	"Lakshadweep",
	"Puducherry",
];
