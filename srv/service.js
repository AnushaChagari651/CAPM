const cds = require('@sap/cds');

module.exports = cds.service.impl(function () {

  const { Orders, OrderItems, Products } = this.entities;

//FUNCTION: Get total from OrderItems
  this.on('getOrderTotal', async (req) => {
    const { orderId } = req.data;

    const items = await SELECT.from(OrderItems)
      .where({ Parent_ID: orderId });

    let total = 0;
    for (let item of items) {
      total += item.TotalPrice;
    }

    return total;
  });


 //BEFORE ACTION: Validate Stock

  this.before('placeOrder', async (req) => {
    const { productId, quantity } = req.data;

    const product = await SELECT.one.from(Products)
      .where({ ID: productId });

    if (!product) {
      req.error(400, "Product not found");
    }

    if (product.Stock < quantity) {
      req.error(
        400,
        `Insufficient stock. Available stock: ${product.Stock}`
      );
    }
  });

// ACTION: Place Order
 
  this.on('placeOrder', async (req) => {

    const { customerId, productId, quantity } = req.data;

    // Fetch product again (for price calculation)
    const product = await SELECT.one.from(Products)
      .where({ ID: productId });

    const total = product.Price * quantity;

    const orderId = cds.utils.uuid();

    // Create Order
    await INSERT.into(Orders).entries({
      ID: orderId,
      OrderDate: new Date(),
      TotalAmount: total,
      Customer_ID: customerId
    });

    // Create Order Item
    await INSERT.into(OrderItems).entries({
      Parent_ID: orderId,
      Product_ID: productId,
      Quantity: quantity,
      TotalPrice: total
    });

    // Update stock
    await UPDATE(Products)
      .set({ Stock: { '-=': quantity } })
      .where({ ID: productId });

    return {
      message: "Order placed successfully",
      orderId
    };
  });
// ACTION: Cancel Order
 this.on('cancelOrder', async (req) => {
  const { orderId } = req.data;

  // 1. Check order exists
  const order = await SELECT.one.from(Orders)
    .where({ ID: orderId });

  if (!order) {
    return "Order not found";
  }

  // 2. Get items
  const items = await SELECT.from(OrderItems)
    .where({ Parent_ID: orderId });

  // 3. Restore stock (optimized)
  for (let item of items) {
    await UPDATE(Products)
      .set({ Stock: { '+=': item.Quantity } })
      .where({ ID: item.Product_ID });
  }

  // 4. Delete order (composition deletes items)
  await DELETE.from(Orders).where({ ID: orderId });

  return "Order cancelled and stock restored successfully";
});
});