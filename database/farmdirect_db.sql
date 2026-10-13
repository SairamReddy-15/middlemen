-- FarmDirect database schema
-- The Spring Boot backend creates/updates these tables automatically
-- (spring.jpa.hibernate.ddl-auto=update). This script is provided as a
-- reference and for manual/bootstrap setup.

CREATE DATABASE IF NOT EXISTS farmdirect_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE farmdirect_db;

CREATE TABLE IF NOT EXISTS users (
  user_id     BIGINT       NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20)  NOT NULL DEFAULT 'CUSTOMER',
  phone       VARCHAR(20)  NULL,
  address     VARCHAR(300) NULL,
  location    VARCHAR(120) NULL,
  farm_name   VARCHAR(150) NULL,
  active      BIT          NOT NULL DEFAULT 1,
  created_at  DATETIME     NULL,
  PRIMARY KEY (user_id),
  UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  product_id      BIGINT       NOT NULL AUTO_INCREMENT,
  farmer_id       BIGINT       NOT NULL,
  name            VARCHAR(150) NOT NULL,
  category        VARCHAR(20)  NOT NULL DEFAULT 'OTHER',
  description     VARCHAR(1000) NULL,
  price           DOUBLE       NOT NULL DEFAULT 0,
  unit            VARCHAR(20)  NOT NULL DEFAULT 'kg',
  stock_quantity  INT          NOT NULL DEFAULT 0,
  image_url       VARCHAR(500) NULL,
  location        VARCHAR(120) NULL,
  active          BIT          NOT NULL DEFAULT 1,
  created_at      DATETIME     NULL,
  updated_at      DATETIME     NULL,
  PRIMARY KEY (product_id),
  KEY idx_products_farmer (farmer_id),
  CONSTRAINT fk_products_farmer FOREIGN KEY (farmer_id) REFERENCES users (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  order_id          BIGINT       NOT NULL AUTO_INCREMENT,
  customer_id       BIGINT       NOT NULL,
  farmer_id         BIGINT       NOT NULL,
  status            VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
  payment_method    VARCHAR(20)  NOT NULL DEFAULT 'CASH_ON_DELIVERY',
  payment_status    VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
  payment_reference VARCHAR(120) NULL,
  total_amount      DOUBLE       NOT NULL DEFAULT 0,
  delivery_address  VARCHAR(300) NOT NULL,
  contact_phone     VARCHAR(20)  NULL,
  notes             VARCHAR(1000) NULL,
  delivery_status   VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
  delivery_agent    VARCHAR(120) NULL,
  delivered_at      DATETIME     NULL,
  created_at        DATETIME     NULL,
  updated_at        DATETIME     NULL,
  PRIMARY KEY (order_id),
  KEY idx_orders_customer (customer_id),
  KEY idx_orders_farmer (farmer_id),
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users (user_id),
  CONSTRAINT fk_orders_farmer FOREIGN KEY (farmer_id) REFERENCES users (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  order_item_id BIGINT       NOT NULL AUTO_INCREMENT,
  order_id      BIGINT       NOT NULL,
  product_id    BIGINT       NULL,
  product_name  VARCHAR(150) NOT NULL,
  unit          VARCHAR(20)  NOT NULL,
  unit_price    DOUBLE       NOT NULL,
  quantity      INT          NOT NULL,
  subtotal      DOUBLE       NOT NULL,
  PRIMARY KEY (order_item_id),
  KEY idx_order_items_order (order_id),
  KEY idx_order_items_product (product_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (order_id),
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (product_id)
) ENGINE=InnoDB;
