import Product from "../models/product.model.js"
import Order from "../models/order.model.js"

export const placeOrder = async (req, res) => {
  try {
    const { products, location, paymentMethod, paymentStatus } = req.body
    
    const dbProducts = await Product.find({
      _id: { $in: products }
    })
    
    const orderItems = products.map(id => {
      return dbProducts.find(p => p._id.toString() === id.toString())
    }).filter(Boolean)

    const totalPrice = orderItems.reduce((acc, item) => acc + item.price, 0)

    const order = await Order.create({
      user: req.user.id,
      products: orderItems,
      totalPrice,
      location: location,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus
    })

    res.json(order)

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const trackOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify the order belongs to the logged in user
    if (order.user.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}