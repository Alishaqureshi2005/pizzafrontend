app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/pizza', require('./routes/pizzaCustomizationRoutes')); 