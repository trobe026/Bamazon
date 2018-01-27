DROP DATABASE IF EXISTS
bamazonDB;

CREATE DATABASE bamazonDB;

USE bamazonDB;

CREATE TABLE departments (
  department_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  department_name VARCHAR(45) NULL,
  over_head_costs DECIMAL(10,2)
);

ALTER TABLE products ADD product_sales DECIMAL(10,2);
