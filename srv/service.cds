using ordermanagement.db as db from '../db/schema';

service OrderManagementService {

    entity Customers as projection on db.Customers;
    entity Orders    as projection on db.Orders;
    entity OrderItems as projection on db.OrderItems;
    entity Products  as projection on db.Products;

//Functions
    
    function getOrderTotal(orderId: UUID) returns Decimal(10,2);

//ACTIONS
    action placeOrder(
        customerId: UUID,
        productId: UUID,
        quantity: Integer
        ) returns String;

    action cancelOrder(orderId: UUID) returns String;

}
