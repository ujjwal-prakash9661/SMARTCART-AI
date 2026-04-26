import Groq from "groq-sdk"
import Product from "../models/product.model.js"
import User from "../models/user.model.js"
import Chat from "../models/chat.model.js"
import Order from '../models/order.model.js'

const groq = new Groq({
    apiKey : process.env.GROQ_API_KEY
})

export const smartAI = async(req, res) => {
    try
    {
        const { message, cartContext } = req.body
        const userId = req.user.id

        const userProfile = await User.findById(userId).select('-password');
        let chat = await Chat.findOne({ user : userId })

        if(!chat)
        {
            chat = await Chat.create({
                user : userId,
                messages : []
            })
        }

        chat.messages.push({
            role : "user",
            content : message
        })

        const lastMessage = chat.messages.slice(-6).map(msg => {
            try {
                const content = msg.role === 'assistant' ? JSON.parse(msg.content).message : msg.content;
                return { role: msg.role, content: content };
            } catch {
                return { role: msg.role, content: msg.content };
            }
        });

        const totalProductCount = await Product.countDocuments();
        const dbCategories = await Product.distinct("category")
        const allProducts = await Product.find({}, 'title category').sort({createdAt: -1}).limit(50);
        const productContextStr = allProducts.map(p => `- ${p.title} (${p.category})`).join(', ');

        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" },
            messages : [
                {
                    role : "system",
                    content : `
                        You are the SmartCart AI assistant. You must be 100% FACTUAL, DETAILED, and HELPFUL.
                        
                        --- LIVE DATABASE METRICS ---
                        Exact Product Count: ${totalProductCount}
                        Exact Category List: [${dbCategories.join(', ')}]
                        Top 50 Catalog: ${productContextStr}
                        User: ${userProfile.name}
                        Cart Items: ${cartContext?.items?.map(i => `${i.title} (Qty: ${i.quantity || 1})`).join(', ') || 'Empty'}
                        
                        --- MANDATORY RULES ---
                        1. NO VAGUE ANSWERS. If a user asks "kya available hai" or "what is in store", you MUST explicitly list at least 5 categories or top products.
                        2. NEVER end a response without providing the actual data requested. 
                        3. AI Tone: Sophisticated and professional Hinglish. Use "Ji" and "Aap".
                        4. Confirm actions (add_to_cart, etc.) with the full product title.
                        
                        --- ACTION SCHEMA ---
                        - add_to_cart: { "type": "add_to_cart", "productName": "..." }
                        - update_quantity: { "type": "update_quantity", "productName": "...", "quantity": number }
                        - show_products: { "type": "show_products", "products": ["Name 1", "Name 2"] }.
                        - show_categories: { "type": "show_categories" }.
                        - checkout_confirm: { "type": "checkout_confirm" }
                        - navigate: { "type": "navigate", "route": "/store" | "/cart" | "/orders" }
                        
                        Return JSON:
                        {
                          "replyText": "Detailed and factual response.",
                          "actions": [],
                          "intent": "general | search_product | navigate",
                          "route": "/path"
                        }
                    ` 
                },
                ...lastMessage
            ]
        })

        let aiText = completion.choices[0].message.content
        let aiData 

        try {
            const jsonMatch = aiText.match(/\{[\s\S]*\}/);
            aiData = JSON.parse(jsonMatch ? jsonMatch[0] : aiText);
        } catch {
            aiData = { replyText: aiText.replace(/\{.*\}/g, '').trim(), actions: [], intent: "general" };
        }

        // Hydrate actions with real DB data
        if (aiData.actions) {
            for (let action of aiData.actions) {
                if (action.type === 'show_products') {
                    const productNames = action.products || [];
                    action.data = await Product.find({
                        title: { $in: productNames.map(name => new RegExp(name, 'i')) }
                    }).limit(5);
                }
                
                if (action.type === 'show_categories') {
                    action.data = dbCategories;
                }

                if (action.type === 'add_to_cart' || action.type === 'update_quantity') {
                    const foundProduct = await Product.findOne({ title: new RegExp(action.productName, 'i') });
                    if (foundProduct) {
                        action.product = foundProduct;
                    }
                }
            }
        }

        // Logic for specific intents
        let finalResponse = { type: "text", message: aiData.replyText, data: null };

        if (aiData.intent === "search_product") {
            const products = await Product.find({}).limit(5);
            finalResponse = { type: "products", message: aiData.replyText, data: products };
        } else if (aiData.intent === "track_order") {
            const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(3);
            finalResponse = { type: "orders", message: aiData.replyText, data: orders };
        }

        // If AI returned show_products/categories action, use that for rich display
        const showProductsAction = aiData.actions?.find(a => a.type === 'show_products');
        if (showProductsAction && showProductsAction.data) {
            finalResponse.type = 'products';
            finalResponse.data = showProductsAction.data;
        }

        const showCategoriesAction = aiData.actions?.find(a => a.type === 'show_categories');
        if (showCategoriesAction && showCategoriesAction.data) {
            finalResponse.type = 'categories';
            finalResponse.data = showCategoriesAction.data;
        }

        chat.messages.push({ role : "assistant", content : JSON.stringify({ type: finalResponse.type, message: finalResponse.message }) });
        await chat.save();

        res.json({ ...aiData, ...finalResponse });

    } catch(err) {
        console.error("AI Controller Error:", err);
        res.status(500).json({ message : "AI Error" });
    }
}