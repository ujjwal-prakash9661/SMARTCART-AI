import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import Activity from '../models/activity.model.js';

export const grantAdminAccess = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found with this email" });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: "User is already an admin" });
        }

        user.role = 'admin';
        await user.save();

        res.json({ message: `Successfully granted admin access to ${email}` });
    } catch (error) {
        console.error("Grant Admin Error:", error);
        res.status(500).json({ message: "Failed to grant admin access" });
    }
};

export const getAdmins = async (req, res) => {
    try {
        const admins = await User.find({
            $or: [
                { role: 'admin' },
                { email: 'ujjwalprakashrc11.22@gmail.com' }
            ]
        }).select('name email role createdAt');

        // Map to format
        const formatted = admins.map(admin => ({
            id: admin._id,
            name: admin.name || admin.email.split('@')[0],
            email: admin.email,
            isSuper: admin.email === 'ujjwalprakashrc11.22@gmail.com'
        }));

        // Sort: Super Admin first
        formatted.sort((a, b) => (b.isSuper ? 1 : 0) - (a.isSuper ? 1 : 0));

        res.json(formatted);
    } catch (error) {
        console.error("Get Admins Error:", error);
        res.status(500).json({ message: "Failed to fetch admin users" });
    }
};

export const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        
        const orders = await Order.find();
        const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

        // For conversion rate, we can do a mock calculation or (orders / users) * 100
        const conversionRate = totalUsers > 0 ? Math.min(100, (totalOrders / totalUsers) * 100).toFixed(1) : 0;
        
        // Avg Order Value
        const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : 0;

        res.json({
            totalRevenue,
            totalOrders,
            totalUsers,
            totalProducts,
            conversionRate,
            avgOrderValue
        });
    } catch (error) {
        console.error("Get Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch stats" });
    }
};

export const getUserActivity = async (req, res) => {
    try {
        // 1. Recent Ratings (Join Product reviews with User details)
        const products = await Product.find({ 'reviews.0': { $exists: true } })
            .select('title reviews')
            .populate('reviews.user', 'name email avatar');

        let recentRatings = [];
        products.forEach(p => {
            p.reviews.forEach(r => {
                recentRatings.push({
                    productId: p._id,
                    productTitle: p.title,
                    user: r.user,
                    rating: r.rating,
                    createdAt: r.createdAt
                });
            });
        });

        // Sort by newest
        recentRatings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // 2. Wishlist Leaderboard
        const usersWithWishlist = await User.find({ 'wishlist.0': { $exists: true } }).select('wishlist');
        const wishlistCounts = {};
        
        usersWithWishlist.forEach(u => {
            u.wishlist.forEach(pId => {
                wishlistCounts[pId] = (wishlistCounts[pId] || 0) + 1;
            });
        });

        const popularProductIds = Object.keys(wishlistCounts)
            .sort((a, b) => wishlistCounts[b] - wishlistCounts[a])
            .slice(0, 5);

        const popularProducts = await Product.find({ _id: { $in: popularProductIds } })
            .select('title image price category');

        const wishlistLeaderboard = popularProducts.map(p => ({
            id: p._id,
            title: p.title,
            image: p.image,
            price: p.price,
            count: wishlistCounts[p._id]
        })).sort((a, b) => b.count - a.count);

        // 3. Search Trends
        const activities = await Activity.find().select('searches');
        const searchCounts = {};
        activities.forEach(a => {
            a.searches.forEach(s => {
                const term = s.toLowerCase().trim();
                searchCounts[term] = (searchCounts[term] || 0) + 1;
            });
        });

        const topSearches = Object.keys(searchCounts)
            .map(term => ({ term, count: searchCounts[term] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        res.json({
            recentRatings: recentRatings.slice(0, 20),
            wishlistLeaderboard,
            topSearches
        });
    } catch (error) {
        console.error("Get User Activity Error:", error);
        res.status(500).json({ message: "Failed to fetch activity analytics" });
    }
};
