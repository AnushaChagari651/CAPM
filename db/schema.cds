namespace ordermanagement.db; 
using {cuid , managed } from '@sap/cds/common';

entity Customers : cuid, managed { 
  CustomerName : String(255); 
  Email : String(255);
  Order : Association to many Orders on Order.Customer = $self;
} 
entity Orders : cuid, managed { 
  OrderDate : Date; 
  TotalAmount : Decimal(10,2); 
  Customer : Association to Customers; 
  items : Composition of many OrderItems on items.Parent = $self; 
} 
entity OrderItems : cuid, managed { 
  Parent : Association to Orders; 
  Product : Association to Products; 
  Quantity : Integer; 
  TotalPrice : Decimal(10,2);
} 
entity Products : cuid, managed { 
  ProductName : String(255); 
  Price : Decimal(10,2); 
  Stock : Integer; 
}