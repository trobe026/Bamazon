DROP DATABASE IF EXISTS
bamazonDB;

CREATE DATABASE bamazonDB;

USE bamazonDB;

CREATE TABLE products (
  item_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  product_name VARCHAR(45) NULL,
  department_name VARCHAR(30) NULL,
  price DECIMAL(10,2),
  stock_quantity DECIMAL(10,2)
);
