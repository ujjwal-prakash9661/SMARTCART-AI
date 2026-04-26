import Product from "../models/product.model.js"

export const createProduct = async(req, res) => {
    const product = await Product.create(req.body)
    res.json(product)
};

export const bulkCreateProducts = async (req, res) => {
  try {
    const products = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Please provide an array of products" });
    }
    const createdProducts = await Product.insertMany(products);
    res.status(201).json(createdProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

import Activity from "../models/activity.model.js"

export const getProducts = async (req, res) => {
  try 
  {
    const { category, search, sort, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    let query = {};

    if (category && category !== 'All Products') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const userId = req.user?.id

    if (userId) {
      let activity = await Activity.findOne({ user: userId });

      if (!activity) {
        activity = await Activity.create({
          user: userId,
          viewedProducts: [],
          searches: search ? [search] : []
        });
      } else if (search) {
        if (search.trim() && activity.searches[activity.searches.length - 1] !== search.trim()) {
          activity.searches.push(search.trim());
          if (activity.searches.length > 50) activity.searches.shift();
          await activity.save();
        }
      }
    }
    
    res.json({
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: Number(page),
      totalProducts
    });
  } 

  catch (err) 
  {
    res.status(500).json({ message: err.message })
  }
}

export const getSingleProduct = async(req, res) => {
    try
    {
        const product = await Product.findById(req.params.id)

        const userId = req.user?.id

        if(userId)
        {
            let activity = await Activity.findOne({ user : userId })

            if(!activity)
            {
                activity = await Activity.create({
                    user : userId,
                    viewedProducts : [req.params.id]
                })
            }

            else
            {
                if(!activity.viewedProducts.includes(req.params.id))
                {
                    activity.viewedProducts.push(req.params.id)
                    await activity.save()
                }
            }
        }

        res.json(product)
    }

    catch(err)
    {
        res.status(500).json({ message: err.message })
    }
}

export const rateProduct = async (req, res) => {
    try {
        const { rating } = req.body;
        const productId = req.params.id;
        const userId = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Please provide a valid rating between 1 and 5" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if user already reviewed
        const existingReview = product.reviews.find(r => r.user.toString() === userId.toString());

        if (existingReview) {
            existingReview.rating = Number(rating);
        } else {
            product.reviews.push({
                user: userId,
                rating: Number(rating)
            });
        }

        // Recalculate average
        product.numReviews = product.reviews.length;
        product.averageRating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save();
        res.status(200).json({ message: "Rating submitted successfully", averageRating: product.averageRating, numReviews: product.numReviews });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getSuggestions = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 2) return res.json([]);

        const products = await Product.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        }).select('title category image price').limit(8);

        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        // Clean and normalize categories: filter null/empty, trim, and unique
        const cleanCategories = [...new Set(categories
            .filter(c => c && c.trim())
            .map(c => c.trim())
        )];
        res.json(cleanCategories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};