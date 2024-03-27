const express = require('express');
const axios = require('axios');
require('dotenv').config()

const app = express();
const PORT = process.env.PORT || 9876;

const windowSize = 10;
// const accessCode = process.env.access_code;
// console.log(accessCode);

let numsWindow = [];

const fetchFromTestAPI = async (apiUrl) => {
    try {
        const res = await axios.get(apiUrl, {
            headers: {
                Authorization: `Bearer ${process.env.accessToken}`
            },
            timeout: 500,
        });
        if (res.status !== 200) {
            console.error(`Error fetching nums from server, status: ${res.status}`);
            return [];
        }
        return res.data.nums;
    } catch (error) {
        console.error('Error fetching nums from server:', error);
        return [];
    }
};

app.use((req, res, next) => {
    if (numsWindow.length >= windowSize) {
        numsWindow.shift();
    }
    next();
});
app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;
    console.log(numberid);
    let apiUrl;


    switch (numberid) {
        case 'p':
            apiUrl = 'http://20.244.56.144/test/primes';
            break;
        case 'f':
            apiUrl = 'http://20.244.56.144/test/fibo';
            break;
        case 'e':
            apiUrl = 'http://20.244.56.144/test/even';
            break;
        case 'r':
            apiUrl = 'http://20.244.56.144/test/rand';
            break;
        default:
            return res.status(400).json({ error: 'Invalid numberid' });
    }

    const nums = await fetchFromTestAPI(apiUrl);

    // not working
    // nums.forEach(num => {
    //     if (!numsWindow.includes(num)) {
    //         numsWindow.push(num);
    //         if (numsWindow.length > windowSize) {
    //             numsWindow.shift();
    //         }
    //     }
    // });

    const average = calculateAverageOfNums(numsWindow);

    const result = {
        nums: nums,
        windowPrevState: numsWindow.slice(0, numsWindow.length - nums.length),
        windowCurrState: numsWindow,
        avg: average.toFixed(2)
    };

    res.json(result);
});

const calculateAverageOfNums = (nums) => {
    if (nums.length === 0) return 0;
    const sum = nums.reduce((acc, curr) => acc + curr, 0);
    return sum / nums.length;
};

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
