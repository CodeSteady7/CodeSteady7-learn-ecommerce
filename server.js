require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const path = require('path');

//useRouter
const useRouter = require('./routes/userRouter');
const categoryRouter = require('./routes/categoryRouter');
const upload = require('./routes/upload');
const productRouter = require('./routes/productRouter');
const paymentRouter = require('./routes/paymentRouter');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(
	fileUpload({
		useTempFiles: true,
	})
);

//Connect to Mongodb
const URL = process.env.MONGODB_URL;
mongoose.connect(
	URL,
	{
		useCreateIndex: true,
		useFindAndModify: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	},
	err => {
		if (err) throw err;
		console.log('Connected to MongoDB');
	}
);

//Routes
app.use('/user', useRouter);
app.use('/api', categoryRouter, upload, productRouter, paymentRouter);

app.get('/', (req, res) => {
	res.json({ msg: 'Welcome my channel, please subscribe for us, Thanks' });
});

//berfungsi untuk membaca file client
if (process.env.NODE_ENV === 'production') {
	app.use(express.static('client/build'));
	app.get('*', (req, res) => {
		res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
	});
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log('Server is running on port', PORT);
});

//devat
//devat0707
