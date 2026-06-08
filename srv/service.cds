using ordermanagement.db as db from '../db/schema';

service OrderManagementService{

    entity Customers  as projection on db.Customers;

    @requires: 'Viewer'
    entity Orders as projection on db.Orders;

    entity OrderItems as projection on db.OrderItems;
    entity Products   as projection on db.Products;

    @restrict: [
        { grant: 'READ', to: 'Viewer' }
    ]
    function getOrderTotal(orderId: UUID) returns Decimal(10,2);
    
    @requires: 'Admin'
    action placeOrder(
        customerId: UUID,
        productId: UUID,
        quantity: Integer
    ) returns String;

    @requires: 'Editor'
    action cancelOrder(orderId: UUID) returns String;
}