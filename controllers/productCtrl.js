const Products = require('../models/productModel');

//Filter, sorting and pagination

class APIfeatures {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}

	filtering() {
		const queryObj = { ...this.queryString }; //querystring = req.query
		// console.log({ queryObj: queryObj }); //before delete
		const excludedFields = ['page', 'sort', 'limit'];
		excludedFields.forEach(el => delete queryObj[el]); // akan menghapus query yang di inputkan d parameter yang berada pada const excludedFields

		// console.log({ queryObj: queryObj }); //after delete

		let queryStr = JSON.stringify(queryObj); //menganti menjadi json
		queryStr = queryStr.replace(
			//menukarkan huruf
			/\b(gte|gt|lt|lte|regex)\b/g,
			match => '$' + match
		);
		// console.log({ queryObj, queryStr });

		// gte= greater than or equal
		// lte= lesser than or equal
		// lt= lesser than
		// gt= greater than
		// regex= mencari string yang sama

		this.query.find(JSON.parse(queryStr)); //menentukan query yang akan dicari
		return this;
	}

	sorting() {
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.split(',').join(' ');
			// console.log(sortBy);
			this.query = this.query.sort(sortBy);
		} else {
			this.query = this.query.sort('-createdAt');
		}
		return this;
	}
	paginating() {
		const page = this.queryString.page * 1 || 1;
		const limit = this.queryString.limit * 1 || 6;
		const skip = (page - 1) * limit;
		this.query = this.query.skip(skip).limit(limit);
		return this;
	}
}

const productCtrl = {
	getProducts: async (req, res) => {
		try {
			const features = new APIfeatures(Products.find(), req.query)
				.filtering()
				.sorting()
				.paginating();
			const products = await features.query;
			// console.log(req.query);
			res.json({
				status: 'success',
				result: products.length,
				products: products,
			});
			res.json({ products });
			// console.log('Features : ', features);
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},
	createProduct: async (req, res) => {
		try {
			const {
				product_id,
				title,
				price,
				description,
				content,
				images,
				category,
			} = req.body;
			if (!images) return res.status(400).json({ msg: 'No Image upload' });

			const product = await Products.findOne({ product_id });
			if (product)
				return res.status(500).json({ msg: 'This product already exists' });
			console.log('product', product);
			const newProduct = new Products({
				product_id,
				title: title.toLowerCase(),
				price,
				description,
				content,
				images,
				category,
			});

			await newProduct.save();
			res.json({ msg: 'Created a product' });
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},
	deleteProduct: async (req, res) => {
		try {
			await Products.findByIdAndDelete(req.params.id);
			res.json({ msg: 'Delete a Product' });
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},

	updateProduct: async (req, res) => {
		try {
			const {
				product_id,
				title,
				price,
				description,
				content,
				images,
				category,
			} = req.body;
			if (!images) return res.status(400).json({ msg: 'No Image upload' });

			await Products.findByIdAndUpdate(
				{ _id: req.params.id },
				{
					product_id,
					title: title.toLowerCase(),
					price,
					description,
					content,
					images,
					category,
				}
			);
			res.json({ msg: 'Update a Product' });
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},
};

module.exports = productCtrl;
